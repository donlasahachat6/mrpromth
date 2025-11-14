#!/bin/bash
# Script to add all environment variables to Vercel
# Run with: bash add-vercel-env.sh

PROJECT_ID="prj_K6ap9dV0MFcuG3T2R91cbZyOxQ43"
TEAM_ID="team_HelZgYoQevSEQv5uV4Scnrwc"

echo "Adding Supabase environment variables..."

# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production --yes <<< "https://pjfxudnrxnjfshxhbsmz.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL preview --yes <<< "https://pjfxudnrxnjfshxhbsmz.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_URL development --yes <<< "https://pjfxudnrxnjfshxhbsmz.supabase.co"

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"

# Use anon key as fallback for service role (limited functionality)
vercel env add SUPABASE_SERVICE_ROLE_KEY production --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"
vercel env add SUPABASE_SERVICE_ROLE_KEY development --yes <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnh1ZG5yeG5qZnNoeGhic216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgxMzcsImV4cCI6MjA3ODY4NDEzN30.WGMGS-lxY2eHd7kAaf32rWVfCTf57nX13HCsjB9SlKE"

echo "Adding Vanchin AI environment variables..."

# Vanchin Base URL
vercel env add VANCHIN_BASE_URL production --yes <<< "https://vanchin.streamlake.ai/api/gateway/v1/endpoints"
vercel env add VANCHIN_BASE_URL preview --yes <<< "https://vanchin.streamlake.ai/api/gateway/v1/endpoints"
vercel env add VANCHIN_BASE_URL development --yes <<< "https://vanchin.streamlake.ai/api/gateway/v1/endpoints"

# Vanchin API Keys and Endpoints (39 pairs)
declare -a API_KEYS=(
  "WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g"
  "3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk"
  "npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50"
  "l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU"
  "Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8"
  "vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg"
  "pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k"
  "cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI"
  "6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI"
  "Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo"
  "a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w"
  "Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw"
  "CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w"
  "ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI"
  "BkcklpfJv9h3bpfZV_J4zPfDN_4PkZ18hoOf39xT-bM"
  "ukzRCs6tqpk04tYoe4ST56a9i3NMrjRE_rh2tKqiys4"
  "dmB83cN8Iq4LDfOgrLKlqNSq6eOiydqyCjKmAkyw2kg"
  "10hmyCXOG7U25BK6f3W-nAhy27ZCh5qF_qCHONLAW3Q"
  "rUexU3L75K0C8F2nkCQnEfKLh6qyR4fm5tF6C5QrJH0"
  "S8dMQV2Za9XF9UxHDIU1otkIy9_cV4Zlw-EwTv8G95k"
  "K8I_AYl8qZM17dtKNPbajmMVoIDpyaW3S_GvtNH8TGE"
  "FSrEEMgiNi719m6YpKFQI2FTo0h8MAwF96QTC7ULWAA"
  "M9zy3HRgyXbvwzD9c0ecAcLC2Nmfvd3OtfTkhrfMLM8"
  "l-iW09oHKvd2gIDnDIq8r360o-mwQLsaDgrLuchaggY"
  "ClAmHlct4WepIRjdrDO4BGUCRL2QVm0IfMte3vUXlPc"
  "wkCvw-9EKIjEL_PH15cJ42mVI_cnbZGVYb08ZLj5gjc"
  "dSSAWhfT3ZNKbGg6Qc0NwhdkK9m-0t_Q4AisvXikohQ"
  "EVezfz68gLieZxBfEd5kVP3xDie4-K7T78F6XD5H_qM"
  "XEF7Nog6ylkh9ocmfJfAaQjuSEbI8lRlvgMtxF7guzg"
  "1ZMInSfQkKyt6_rHZ9RBUU6GfN5v9CqIXqF9QkJ7P-I"
  "lILZMgmcuPfcvBBS8fANiik6AVYJjleOZScB_2wcTBQ"
  "U0grlCVFkAbJiD-IB1c0lNBrdvjXXlx7as4dseBJOD0"
  "-0d-oG8Cro_ELE0-HmiJExReWcm0X7ismY44aSm0atM"
  "tH93VBcVfCQtiOdvGZvFbJsDdwKciX5NRk0GSLVrXQU"
  "o4zh8GvzGChB4eCEpS7YyMwly66E-tnwKF0VfkIXAJg"
  "bWiT3KNF5oUyS0HRTE6r2jgG_PUS0oINVa-1vldS3lI"
  "yJfCVYmtsXIJTGa2LIa0MNigw6ncFl2Umfs4t-tIM7s"
  "BtnzIZwMecphnVqR-95l1QCPDRkJqaHuEQAu4CI1jzs"
  "mk3IEpn4EQomPceum6ALgOdHjwHAZJo52xllz0y32B8"
)

declare -a ENDPOINTS=(
  "ep-lpvcnv-1761467347624133479"
  "ep-j9pysc-1761467653839114083"
  "ep-2uyob4-1761467835762653881"
  "ep-nqjal5-1762460264139958733"
  "ep-mhsvw6-1762460362477023705"
  "ep-h614n9-1762460436283699679"
  "ep-ohxawl-1762460514611065743"
  "ep-bng3os-1762460592040033785"
  "ep-kazx9x-1761818165668826967"
  "ep-6bl8j9-1761818251624808527"
  "ep-2d9ubo-1761818334800110875"
  "ep-dnxrl0-1761818420368606961"
  "ep-nmgm5b-1761818484923833700"
  "ep-8rvmfy-1762460863026449765"
  "ep-9biod2-1762526038830669057"
  "ep-i26k60-1762526143717606119"
  "ep-cl50ma-1762526243110761604"
  "ep-dwjj6e-1762526348838423254"
  "ep-3lcllc-1762526444990494960"
  "ep-2413pa-1762717382430456136"
  "ep-dx6u6x-1762717500329865523"
  "ep-1hgecd-1762717616298813374"
  "ep-a7e9vq-1762717690898891391"
  "ep-iirnnw-1762717807400626488"
  "ep-kl1m44-1762717877775552126"
  "ep-kmr2a4-1762717937082843139"
  "ep-flyx11-1762718012976180623"
  "ep-g13jp9-1762718063914076742"
  "ep-69ldjc-1762718159855414980"
  "ep-qrifn2-1762718223594140651"
  "ep-yk4tzm-1762718262280052118"
  "ep-3fovlj-1762718337530343371"
  "ep-e0r6th-1762718412853064508"
  "ep-0het4u-1762718483377671067"
  "ep-2r2twg-1762718550058919999"
  "ep-679xkw-1762718599472137899"
  "ep-xhipph-1762718729562374325"
  "ep-0ep1kt-1762718794743744176"
  "ep-mb0m44-1762718869832867784"
)

for i in {0..38}; do
  idx=$((i + 1))
  echo "Adding VANCHIN_API_KEY_$idx and VANCHIN_ENDPOINT_$idx..."
  
  vercel env add "VANCHIN_API_KEY_$idx" production --yes <<< "${API_KEYS[$i]}"
  vercel env add "VANCHIN_API_KEY_$idx" preview --yes <<< "${API_KEYS[$i]}"
  vercel env add "VANCHIN_API_KEY_$idx" development --yes <<< "${API_KEYS[$i]}"
  
  vercel env add "VANCHIN_ENDPOINT_$idx" production --yes <<< "${ENDPOINTS[$i]}"
  vercel env add "VANCHIN_ENDPOINT_$idx" preview --yes <<< "${ENDPOINTS[$i]}"
  vercel env add "VANCHIN_ENDPOINT_$idx" development --yes <<< "${ENDPOINTS[$i]}"
done

echo "✅ All environment variables added successfully!"
echo "Total: 82 variables (3 Supabase + 1 Vanchin Base + 78 Vanchin pairs)"
