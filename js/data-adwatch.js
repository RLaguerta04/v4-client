// ── AdWatch workspace ──
// Loaded BEFORE app.js on every /adwatch/ page. Sets window.WS='adwatch'. With WS_DATA left empty,
// app.js hands AdWatch an independent deep *clone* of the MediaWatch datasets — so its Mentions,
// Activity Tracker and Dashboard mirror MediaWatch while staying its own copy. Add arrays here to diverge.
window.WS = 'adwatch';
window.WS_DATA = {};
