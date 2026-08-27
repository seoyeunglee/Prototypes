const REPO = process.env.DESC_REPO || "idbrnd/prd-flow";
const PATH = process.env.DESC_PATH || "edge-resource-watchdog/wireframe/descs/data.json";
const BRANCH = process.env.DESC_BRANCH || "main";

const ARRAY_SCOPES = { screen: "screenPolicies", logic: "logicPolicies", priority: "priorityPolicies" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST 메서드만 허용됩니다." });
  const { scope, num, body } = req.body || {};
  const isArrayScope = Object.prototype.hasOwnProperty.call(ARRAY_SCOPES, scope);
  const isSummary = scope === "prioritySummary";
  if ((!isArrayScope && !isSummary) || typeof body !== "string" || (isArrayScope && !num))
    return res.status(400).json({ error: "scope(screen|logic|priority|prioritySummary), num(배열 scope), body(문자열)가 필요합니다." });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: "GITHUB_TOKEN 환경변수가 설정되지 않았습니다." });

  const api = `https://api.github.com/repos/${REPO}/contents/${PATH}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "desc-editor" };
  try {
    const getRes = await fetch(`${api}?ref=${BRANCH}`, { headers });
    if (!getRes.ok) return res.status(502).json({ error: "data.json 읽기 실패", detail: await getRes.text() });
    const file = await getRes.json();
    const data = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

    let label;
    if (isSummary) {
      if (!data.prioritySummary) data.prioritySummary = { body: "" };
      if (data.prioritySummary.body === body) return res.status(200).json({ ok: true, unchanged: true });
      data.prioritySummary.body = body;
      label = "prioritySummary";
    } else {
      const list = data[ARRAY_SCOPES[scope]];
      const target = Array.isArray(list) ? list.find((p) => p.num === num) : null;
      if (!target) return res.status(404).json({ error: `${scope} 정책 ${num}을(를) 찾을 수 없습니다.` });
      if (target.body === body) return res.status(200).json({ ok: true, unchanged: true });
      target.body = body;
      label = `${scope} ${num}`;
    }

    const newContent = JSON.stringify(data, null, 2) + "\n";
    const putRes = await fetch(api, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `edit(desc): ${label} 인스펙션 편집`,
        content: Buffer.from(newContent, "utf-8").toString("base64"),
        sha: file.sha,
        branch: BRANCH,
      }),
    });
    if (!putRes.ok) return res.status(502).json({ error: "커밋 실패", detail: await putRes.text() });
    const result = await putRes.json();
    return res.status(200).json({ ok: true, commit: result.commit && result.commit.sha });
  } catch (e) {
    return res.status(500).json({ error: "처리 중 오류", detail: String(e) });
  }
}
