import { getAccessToken } from "./firebase";

export interface VisitorData {
  name: string;
  whatsapp: string;
  email: string;
  visitorType: string;
  pastoralContact: boolean;
  prayerRequests: string;
  ministriesInterest: string;
}

export async function submitToSheet(data: VisitorData): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  let sheetId = localStorage.getItem('visitor_sheet_id');

  if (!sheetId) {
    console.log("No existing spreadsheet found. Creating a new one...");
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: "Registros de Visitantes - Igreja"
        }
      })
    });
    const createData = await createRes.json();
    if (createData.error) {
       throw new Error(createData.error.message || "Failed to create sheet");
    }
    sheetId = createData.spreadsheetId;
    localStorage.setItem('visitor_sheet_id', sheetId as string);

    // Initial Headers
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:G1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [["Data/Hora", "Nome", "WhatsApp", "E-mail", "Tipo de Visitante", "Contato Pastoral", "Pedidos de Oração", "Interesse em Ministérios"]]
      })
    });
  }

  // Row Data Format
  const rowData = [
    new Date().toLocaleString('pt-BR'),
    data.name,
    data.whatsapp,
    data.email,
    data.visitorType,
    data.pastoralContact ? "Sim" : "Não",
    data.prayerRequests,
    data.ministriesInterest
  ];

  const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowData]
    })
  });
  
  if (!appendRes.ok) {
     const errorData = await appendRes.json();
     throw new Error(errorData.error?.message || "Failed to append data to Google Sheets");
  }
}

export async function getVisitorsData(): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const sheetId = localStorage.getItem('visitor_sheet_id');
  if (!sheetId) throw new Error("Nenhuma planilha encontrada. Registre um visitante primeiro.");

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:H`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return data.values || [];
}
