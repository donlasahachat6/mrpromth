import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface CloneOptions {
  branch?: string;
  depth?: number;
  targetDir?: string;
}

export interface CommitOptions {
  message: string;
  branch?: string;
  author?: {
    name: string;
    email: string;
  };
}

export class GitHubIntegration {
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token
    });
  }

  /**
   * Clone a repository using GitHub CLI
   */
  async cloneRepository(options: CloneOptions = {}): Promise<{ success: boolean; path: string; error?: string }> {
    try {
      const { branch = 'main', depth, targetDir } = options;
      const repoUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;
      const cloneDir = targetDir || join('/tmp', 'repos', this.config.repo);

      // Create directory
      await mkdir(cloneDir, { recursive: true });

      // Build clone command
      let cloneCmd = `git clone ${repoUrl} ${cloneDir}`;
      if (branch) {
        cloneCmd += ` --branch ${branch}`;
      }
      if (depth) {
        cloneCmd += ` --depth ${depth}`;
      }

      // Execute clone
      const { stdout, stderr } = await execAsync(cloneCmd);

      return {
        success: true,
        path: cloneDir
      };
    } catch (error: any) {
      console.error('Clone error:', error);
      return {
        success: false,
        path: '',
        error: error.message
      };
    }
  }

  /**
   * Push changes to repository using GitHub CLI
   */
  async pushChanges(
    repoPath: string,
    options: CommitOptions
  ): Promise<{ success: boolean; commitSha?: string; error?: string }> {
    try {
      const { message, branch = 'main', author } = options;

      // Configure git user if provided
      if (author) {
        await execAsync(`cd ${repoPath} && git config user.name "${author.name}"`);
        await execAsync(`cd ${repoPath} && git config user.email "${author.email}"`);
      }

      // Add all changes
      await execAsync(`cd ${repoPath} && git add -A`);

      // Check if there are changes to commit
      const { stdout: statusOutput } = await execAsync(`cd ${repoPath} && git status --porcelain`);
      if (!statusOutput.trim()) {
        return {
          success: true,
          commitSha: undefined,
          error: 'No changes to commit'
        };
      }

      // Commit changes
      await execAsync(`cd ${repoPath} && git commit -m "${message}"`);

      // Get commit SHA
      const { stdout: shaOutput } = await execAsync(`cd ${repoPath} && git rev-parse HEAD`);
      const commitSha = shaOutput.trim();

      // Push to remote
      await execAsync(`cd ${repoPath} && git push origin ${branch}`);

      return {
        success: true,
        commitSha
      };
    } catch (error: any) {
      console.error('Push error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new file in repository
   */
  async createFile(
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      });

      return { success: true };
    } catch (error: any) {
      console.error('Create file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update an existing file in repository
   */
  async updateFile(
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current file to get SHA
      const { data: currentFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: branch
      });

      if (Array.isArray(currentFile) || currentFile.type !== 'file') {
        throw new Error('Path is not a file');
      }

      // Update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.sha,
        branch
      });

      return { success: true };
    } catch (error: any) {
      console.error('Update file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from repository
   */
  async deleteFile(
    path: string,
    message: string,
    branch: string = 'main'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current file to get SHA
      const { data: currentFile } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: branch
      });

      if (Array.isArray(currentFile) || currentFile.type !== 'file') {
        throw new Error('Path is not a file');
      }

      // Delete file
      await this.octokit.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        sha: currentFile.sha,
        branch
      });

      return { success: true };
    } catch (error: any) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List repository contents
   */
  async listContents(path: string = '', branch: string = 'main'): Promise<any[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: branch
      });

      return Array.isArray(data) ? data : [data];
    } catch (error: any) {
      console.error('List contents error:', error);
      return [];
    }
  }

  /**
   * Get file content
   */
  async getFileContent(path: string, branch: string = 'main'): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: branch
      });

      if (Array.isArray(data) || data.type !== 'file') {
        return null;
      }

      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (error: any) {
      console.error('Get file content error:', error);
      return null;
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(newBranch: string, fromBranch: string = 'main'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the SHA of the from branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${fromBranch}`
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${newBranch}`,
        sha: ref.object.sha
      });

      return { success: true };
    } catch (error: any) {
      console.error('Create branch error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    title: string,
    head: string,
    base: string = 'main',
    body?: string
  ): Promise<{ success: boolean; number?: number; error?: string }> {
    try {
      const { data } = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title,
        head,
        base,
        body
      });

      return {
        success: true,
        number: data.number
      };
    } catch (error: any) {
      console.error('Create PR error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get repository information
   */
  async getRepoInfo(): Promise<any> {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });

      return data;
    } catch (error: any) {
      console.error('Get repo info error:', error);
      return null;
    }
  }

  /**
   * List branches
   */
  async listBranches(): Promise<string[]> {
    try {
      const { data } = await this.octokit.repos.listBranches({
        owner: this.config.owner,
        repo: this.config.repo
      });

      return data.map(branch => branch.name);
    } catch (error: any) {
      console.error('List branches error:', error);
      return [];
    }
  }

  /**
   * Get commit history
   */
  async getCommits(branch: string = 'main', limit: number = 10): Promise<any[]> {
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        sha: branch,
        per_page: limit
      });

      return data;
    } catch (error: any) {
      console.error('Get commits error:', error);
      return [];
    }
  }
}

/**
 * Create GitHub integration instance from environment
 */
export function createGitHubIntegration(owner: string, repo: string): GitHubIntegration | null {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('GITHUB_TOKEN not found in environment');
    return null;
  }

  return new GitHubIntegration({
    token,
    owner,
    repo
  });
}
