#!/bin/bash

# Upload Environment Variables to Vercel
# This script requires VERCEL_TOKEN environment variable

PROJECT_ID="prj_K6ap9dV0MFcuG3T2R91cbZyOxQ43"
TEAM_ID="team_HelZgYoQevSEQv5uV4Scnrwc"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Error: VERCEL_TOKEN not set"
  echo "Please set VERCEL_TOKEN environment variable"
  exit 1
fi

echo "Uploading NEXT_PUBLIC_SUPABASE_URL..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXT_PUBLIC_SUPABASE_URL","value":"https://liywmjxhllpexzrnuhlu.supabase.co","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading NEXT_PUBLIC_SUPABASE_ANON_KEY..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXT_PUBLIC_SUPABASE_ANON_KEY","value":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpeXdtanhobGxwZXh6cm51aGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI5OTQsImV4cCI6MjA3ODIzODk5NH0.64jwIELip8KiAR0i5uXCjp0CYvsQUOYSxKM83zSTXoE","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY","value":"sb_publishable_8ZlcRVFhxlk2muMHneo-mQ_pJP7Wx7_","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_BASE_URL..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_BASE_URL","value":"https://vanchin.streamlake.ai/api/gateway/v1/endpoints","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_1..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_1","value":"WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_1..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_1","value":"ep-lpvcnv-1761467347624133479","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_2..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_2","value":"3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_2..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_2","value":"ep-j9pysc-1761467653839114083","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_3..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_3","value":"npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_3..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_3","value":"ep-2uyob4-1761467835762653881","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_4..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_4","value":"l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_4..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_4","value":"ep-nqjal5-1762460264139958733","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_5..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_5","value":"Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_5..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_5","value":"ep-mhsvw6-1762460362477023705","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_6..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_6","value":"vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_6..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_6","value":"ep-h614n9-1762460436283699679","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_7..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_7","value":"pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_7..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_7","value":"ep-ohxawl-1762460514611065743","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_8..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_8","value":"cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_8..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_8","value":"ep-bng3os-1762460592040033785","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_9..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_9","value":"6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_9..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_9","value":"ep-kazx9x-1761818165668826967","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_10..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_10","value":"Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_10..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_10","value":"ep-6bl8j9-1761818251624808527","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_11..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_11","value":"a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_11..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_11","value":"ep-2d9ubo-1761818334800110875","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_12..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_12","value":"Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_12..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_12","value":"ep-dnxrl0-1761818420368606961","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_13..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_13","value":"CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_13..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_13","value":"ep-nmgm5b-1761818484923833700","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_14..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_14","value":"ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_14..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_14","value":"ep-8rvmfy-1762460863026449765","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_15..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_15","value":"BkcklpfJv9h3bpfZV_J4zPfDN_4PkZ18hoOf39xT-bM","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_15..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_15","value":"ep-9biod2-1762526038830669057","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_16..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_16","value":"ukzRCs6tqpk04tYoe4ST56a9i3NMrjRE_rh2tKqiys4","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_16..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_16","value":"ep-i26k60-1762526143717606119","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_17..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_17","value":"dmB83cN8Iq4LDfOgrLKlqNSq6eOiydqyCjKmAkyw2kg","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_17..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_17","value":"ep-cl50ma-1762526243110761604","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_18..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_18","value":"10hmyCXOG7U25BK6f3W-nAhy27ZCh5qF_qCHONLAW3Q","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_18..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_18","value":"ep-dwjj6e-1762526348838423254","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_19..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_19","value":"rUexU3L75K0C8F2nkCQnEfKLh6qyR4fm5tF6C5QrJH0","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_19..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_19","value":"ep-3lcllc-1762526444990494960","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_20..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_20","value":"S8dMQV2Za9XF9UxHDIU1otkIy9_cV4Zlw-EwTv8G95k","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_20..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_20","value":"ep-2413pa-1762717382430456136","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_21..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_21","value":"K8I_AYl8qZM17dtKNPbajmMVoIDpyaW3S_GvtNH8TGE","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_21..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_21","value":"ep-dx6u6x-1762717500329865523","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_22..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_22","value":"FSrEEMgiNi719m6YpKFQI2FTo0h8MAwF96QTC7ULWAA","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_22..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_22","value":"ep-1hgecd-1762717616298813374","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_23..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_23","value":"M9zy3HRgyXbvwzD9c0ecAcLC2Nmfvd3OtfTkhrfMLM8","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_23..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_23","value":"ep-a7e9vq-1762717690898891391","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_24..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_24","value":"l-iW09oHKvd2gIDnDIq8r360o-mwQLsaDgrLuchaggY","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_24..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_24","value":"ep-iirnnw-1762717807400626488","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_25..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_25","value":"ClAmHlct4WepIRjdrDO4BGUCRL2QVm0IfMte3vUXlPc","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_25..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_25","value":"ep-kl1m44-1762717877775552126","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_26..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_26","value":"wkCvw-9EKIjEL_PH15cJ42mVI_cnbZGVYb08ZLj5gjc","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_26..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_26","value":"ep-kmr2a4-1762717937082843139","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_27..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_27","value":"dSSAWhfT3ZNKbGg6Qc0NwhdkK9m-0t_Q4AisvXikohQ","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_27..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_27","value":"ep-flyx11-1762718012976180623","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_28..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_28","value":"EVezfz68gLieZxBfEd5kVP3xDie4-K7T78F6XD5H_qM","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_28..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_28","value":"ep-g13jp9-1762718063914076742","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_29..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_29","value":"XEF7Nog6ylkh9ocmfJfAaQjuSEbI8lRlvgMtxF7guzg","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_29..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_29","value":"ep-69ldjc-1762718159855414980","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_30..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_30","value":"1ZMInSfQkKyt6_rHZ9RBUU6GfN5v9CqIXqF9QkJ7P-I","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_30..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_30","value":"ep-qrifn2-1762718223594140651","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_31..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_31","value":"lILZMgmcuPfcvBBS8fANiik6AVYJjleOZScB_2wcTBQ","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_31..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_31","value":"ep-yk4tzm-1762718262280052118","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_32..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_32","value":"U0grlCVFkAbJiD-IB1c0lNBrdvjXXlx7as4dseBJOD0","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_32..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_32","value":"ep-3fovlj-1762718337530343371","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_33..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_33","value":"-0d-oG8Cro_ELE0-HmiJExReWcm0X7ismY44aSm0atM","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_33..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_33","value":"ep-e0r6th-1762718412853064508","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_34..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_34","value":"tH93VBcVfCQtiOdvGZvFbJsDdwKciX5NRk0GSLVrXQU","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_34..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_34","value":"ep-0het4u-1762718483377671067","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_35..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_35","value":"o4zh8GvzGChB4eCEpS7YyMwly66E-tnwKF0VfkIXAJg","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_35..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_35","value":"ep-2r2twg-1762718550058919999","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_36..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_36","value":"bWiT3KNF5oUyS0HRTE6r2jgG_PUS0oINVa-1vldS3lI","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_36..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_36","value":"ep-679xkw-1762718599472137899","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_37..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_37","value":"yJfCVYmtsXIJTGa2LIa0MNigw6ncFl2Umfs4t-tIM7s","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_37..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_37","value":"ep-xhipph-1762718729562374325","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_38..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_38","value":"BtnzIZwMecphnVqR-95l1QCPDRkJqaHuEQAu4CI1jzs","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_38..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_38","value":"ep-0ep1kt-1762718794743744176","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_API_KEY_39..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_API_KEY_39","value":"mk3IEpn4EQomPceum6ALgOdHjwHAZJo52xllz0y32B8","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading VANCHIN_ENDPOINT_39..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VANCHIN_ENDPOINT_39","value":"ep-mb0m44-1762718869832867784","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading NEXT_PUBLIC_APP_URL..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NEXT_PUBLIC_APP_URL","value":"https://mrpromth-azure.vercel.app","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "Uploading NODE_ENV..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NODE_ENV","value":"production","type":"encrypted","target":["production","preview","development"]}'
sleep 0.5

echo "✅ All environment variables uploaded!"
echo "🔄 Please redeploy your project for changes to take effect."
