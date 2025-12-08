import api from "../../../lib/axios";

// 🔥 VERSION PRO — projectId passé en paramètre
export async function handleDownload(
  projectId: string,
  docId: number,
  originalName: string
) {
  try {
    const res = await api.get(
      `/projects/${projectId}/documents/${docId}/download?mode=download`,
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], {
      type: res.headers["content-type"] || "application/octet-stream",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
}
  export async function downloadDocument(projectId: string, docId: number, originalName: string) {
  try {
    const API_URL = "http://localhost:8000/api/v1";
    const url = `${API_URL}/projects/${projectId}/documents/${docId}/download`;

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Download error:", await res.text());
      return;
    }

    const blob = await res.blob();

    // 👉 Empêche l’ouverture dans un onglet (clé du succès)
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = originalName;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

  } catch (err) {
    console.error("Download exception:", err);
  }
}
