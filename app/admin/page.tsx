'use client'

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Users, Key, FileText, Settings, Activity } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

interface Log {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  message: string;
}

interface SystemStatus {
  agents: number;
  status: string;
  vercel: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    agents: 7,
    status: 'IDLE',
    vercel: 'Connected'
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users (mock data for now)
      setUsers([
        {
          id: '1',
          email: 'user1@example.com',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          created_at: new Date().toISOString(),
          last_sign_in_at: null,
        },
      ]);

      // Load API keys (mock data)
      setAPIKeys([
        {
          id: '1',
          name: 'Production Key',
          key: 'sk_prod_**********************',
          created_at: new Date().toISOString(),
        },
      ]);

      // Load logs (mock data)
      setLogs([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System started successfully',
        },
        {
          id: '2',
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Failed to connect to database',
        },
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;
    
    // TODO: Implement user deletion
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ API Key นี้?')) return;
    
    // TODO: Implement API key deletion
    setAPIKeys(prev => prev.filter(k => k.id !== keyId));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">จัดการระบบ Mr.Prompt</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            Status
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('th-TH')
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Create New Key
            </Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell className="font-mono text-sm">{key.key}</TableCell>
                    <TableCell>{new Date(key.created_at).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAPIKey(key.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search logs..." className="max-w-sm" />
            <Button variant="outline">Search</Button>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-700' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agents</p>
                  <p className="text-2xl font-bold">{systemStatus.agents}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold">{systemStatus.status}</p>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  systemStatus.status === 'IDLE' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vercel</p>
                  <p className="text-2xl font-bold">{systemStatus.vercel}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p className="text-sm text-muted-foreground">
                ตั้งค่าระบบพื้นฐาน
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Agent Mode</p>
                  <p className="text-sm text-muted-foreground">เปิดใช้งานโหมด Agent</p>
                </div>
                <Button variant="outline">Toggle</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">ปิดระบบเพื่อบำรุงรักษา</p>
                </div>
                <Button variant="outline">Toggle</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
