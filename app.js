const STORAGE_KEY = "de-planning-studio-2627-v1";

const colleagues = [
  "Claudia Waldner",
  "Evi Liatiri",
  "Fawei Geng",
  "Jill Fresen",
  "Maria Robertson",
  "Marion Manton",
  "Martha Zumack",
  "Nithya Ramadoss",
  "Sandra Morales Rios",
  "Tawa Edwards",
  "Will Bowden-Benn",
  "Xavier Laurent",
];

const themes = [
  {
    name: "AI",
    description: "Work related to AI support, offer definition, assessment conversations, and team upskilling.",
    workstreams: [
      "AI and summative assessment workshops and conversations",
      "AI in teaching and learning - define offer",
      "AI diagnostic / needs-analysis work",
      "AI support / upskilling for the DE team",
      "AI tools in Canvas",
    ],
  },
  {
    name: "Canvas and Digital Tools",
    description: "Day-to-day platform support, roadmap work, transitions, and continuity planning.",
    workstreams: [
      "Day-to-day Canvas / VLE support",
      "VLE roadmap, sprint planning and BA/PO work",
      "AI tools in Canvas",
      "Canvas COG",
      "Other tools transitions and updates, including Mentimeter, H5P, Epigeum, Turnitin",
      "Business continuity planning",
      "Canvas for summative assessment considerations",
    ],
  },
  {
    name: "Communities, Networks, and Sector Engagement",
    description: "External groups, sector engagement, events, and local community connections.",
    workstreams: [
      "DETUG, Big 6 link and teaching support",
      "AllOxLTs",
        "External communities, eg HELF / IVY / Canvas user group / UCISA / ALT or other",
      "CMALT",
      "KEFs and other events",
      "Communities links with Digital Education support resourcing",
    ],
  },
  {
    name: "Consultancy",
    description: "Consultancy leadership, new consultancy work, and service improvements.",
    workstreams: [
      "Lead and/or coordinate current consultancies",
      "Lead and/or coordinate new course and assessment (re)design consultancies",
      "Consultancy service updates / enhancements",
    ],
  },
  {
    name: "Digital Education Leadership and Governance",
    description: "Strategy, reporting, metrics, surveys, review work, and future role shaping.",
    workstreams: [
      "Digital Education Strategy",
      "Digital Education Strategy reporting",
      "DE team reporting and metrics",
      "Staff survey",
      "Student feedback / APP / ACE metrics",
      "DETSG work",
      "CTL review",
      "Any future new roles / JD changes",
    ],
  },
  {
    name: "Digital Education Service Offer",
    description: "Service desk, spaces, training, resourcing, outreach, and service model questions.",
    workstreams: [
      "DE service desk",
      "Physical teaching spaces",
      "DE training offer, including asynchronous delivery",
      "DE resourcing work (aka SUMS)",
      "Support offer for departments and teams",
      "Outreach programmes",
      "OEH transition and support for executive education",
      "Recharging / service model questions",
    ],
  },
  {
    name: "Planning, Reporting, Communications, and Evidence",
    description: "Evidence, reporting, website work, and communication of services and changes.",
    workstreams: [
      "Evidencing and reporting our work",
      "Website",
      "Communication of services and changes",
    ],
  },
  {
    name: "Underpinning Themes",
    description: "Cross-cutting areas that sit behind the rest of the work.",
    workstreams: [
      "Digital Accessibility",
      "University data work",
      "Cross-Oxford work and partnerships (please add some examples of this work)",
      "AI as an underpinning theme (please add any additional AI work not captured already)",
      "Professional development / upskilling for the DE team",
      "Alignment with university initiatives and strategies",
    ],
  },
];

const defaultState = {
  selectedPerson: colleagues[0],
  currentThemeIndex: 0,
  responses: {},
  ideas: [],
};

let state = loadState();

const personSelect = document.getElementById("personSelect");
const themeNav = document.getElementById("themeNav");
const themeProgress = document.getElementById("themeProgress");
const themeTitle = document.getElementById("themeTitle");
const themeDescription = document.getElementById("themeDescription");
const leadingCount = document.getElementById("leadingCount");
const interestYesCount = document.getElementById("interestYesCount");
const interestMaybeCount = document.getElementById("interestMaybeCount");
const skillCount = document.getElementById("skillCount");
const workstreamList = document.getElementById("workstreamList");
const prevThemeBtn = document.getElementById("prevThemeBtn");
const nextThemeBtn = document.getElementById("nextThemeBtn");
const nextThemeBtnBottom = document.getElementById("nextThemeBtnBottom");
const ideaTheme = document.getElementById("ideaTheme");
const ideaForm = document.getElementById("ideaForm");
const ideaTitle = document.getElementById("ideaTitle");
const ideaDescription = document.getElementById("ideaDescription");
const ideasList = document.getElementById("ideasList");
const teamFilterPerson = document.getElementById("teamFilterPerson");
const teamFilterTheme = document.getElementById("teamFilterTheme");
const teamTableBody = document.getElementById("teamTableBody");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const workstreamTemplate = document.getElementById("workstreamTemplate");

init();

function init() {
  populatePeople();
  populateThemes();
  bindEvents();
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      responses: parsed.responses || {},
      ideas: parsed.ideas || [],
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populatePeople() {
  personSelect.innerHTML = "";
  teamFilterPerson.innerHTML = "";

  colleagues.forEach((person) => {
    personSelect.add(new Option(person, person));
  });

  teamFilterPerson.add(new Option("All people", ""));
  colleagues.forEach((person) => {
    teamFilterPerson.add(new Option(person, person));
  });
}

function populateThemes() {
  themeNav.innerHTML = "";
  ideaTheme.innerHTML = "";
  teamFilterTheme.innerHTML = "";

  themes.forEach((theme, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = theme.name;
    button.dataset.index = index;
    themeNav.appendChild(button);

    ideaTheme.add(new Option(theme.name, theme.name));
    teamFilterTheme.add(new Option(theme.name, theme.name));
  });

  teamFilterTheme.prepend(new Option("All themes", ""));
}

function bindEvents() {
  personSelect.addEventListener("change", () => {
    persistVisibleWorkstreams();
    state.selectedPerson = personSelect.value;
    saveState();
    render();
  });

  themeNav.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    persistVisibleWorkstreams();
    state.currentThemeIndex = Number(button.dataset.index);
    saveState();
    render();
  });

  prevThemeBtn.addEventListener("click", () => {
    persistVisibleWorkstreams();
    state.currentThemeIndex = Math.max(0, state.currentThemeIndex - 1);
    saveState();
    render();
  });

  const goToNextTheme = () => {
    persistVisibleWorkstreams();
    state.currentThemeIndex = Math.min(themes.length - 1, state.currentThemeIndex + 1);
    saveState();
    render();
  };

  nextThemeBtn.addEventListener("click", goToNextTheme);
  nextThemeBtnBottom.addEventListener("click", goToNextTheme);

  ideaForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!ideaTitle.value.trim() || !ideaDescription.value.trim()) return;

    state.ideas.unshift({
      id: crypto.randomUUID(),
      person: state.selectedPerson,
      theme: ideaTheme.value,
      title: ideaTitle.value.trim(),
      description: ideaDescription.value.trim(),
      createdAt: new Date().toISOString(),
    });

    ideaForm.reset();
    ideaTheme.value = currentTheme().name;
    saveState();
    renderIdeas();
  });

  ideasList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-idea]");
    if (!deleteButton) return;
    state.ideas = state.ideas.filter((idea) => idea.id !== deleteButton.dataset.deleteIdea);
    saveState();
    renderIdeas();
  });

  teamFilterPerson.addEventListener("change", renderTeamTable);
  teamFilterTheme.addEventListener("change", renderTeamTable);

  downloadBtn.addEventListener("click", () => {
    persistVisibleWorkstreams();
    downloadState();
  });
  resetBtn.addEventListener("click", () => {
    state = structuredClone(defaultState);
    saveState();
    render();
  });
}

function render() {
  personSelect.value = state.selectedPerson;
  ideaTheme.value = currentTheme().name;
  renderThemeNav();
  renderThemeHeader();
  renderSummary();
  renderWorkstreams();
  renderIdeas();
  renderTeamTable();
}

function renderThemeNav() {
  themeProgress.textContent = `${state.currentThemeIndex + 1} / ${themes.length}`;
  [...themeNav.children].forEach((button, index) => {
    button.classList.toggle("active", index === state.currentThemeIndex);
  });
}

function renderThemeHeader() {
  const theme = currentTheme();
  themeTitle.textContent = theme.name;
  themeDescription.textContent = theme.description;
  prevThemeBtn.disabled = state.currentThemeIndex === 0;
  nextThemeBtn.textContent = state.currentThemeIndex === themes.length - 1 ? "Stay on final theme" : "Next theme";
  nextThemeBtnBottom.textContent = nextThemeBtn.textContent;
}

function renderSummary() {
  const personResponses = Object.values(state.responses).filter((entry) => entry.person === state.selectedPerson);
  leadingCount.textContent = personResponses.filter((entry) => entry.current === "Leading").length;
  interestYesCount.textContent = personResponses.filter((entry) => entry.more === "Yes").length;
  interestMaybeCount.textContent = personResponses.filter((entry) => entry.more === "Maybe").length;
  skillCount.textContent = personResponses.filter((entry) => entry.skill === "Yes").length;
}

function renderWorkstreams() {
  workstreamList.innerHTML = "";
  const theme = currentTheme();

  theme.workstreams.forEach((workstream) => {
    const node = workstreamTemplate.content.firstElementChild.cloneNode(true);
    const key = responseKey(state.selectedPerson, workstream);
    const existing = state.responses[key] || {};

    node.querySelector(".workstream-title").textContent = workstream;

    const currentSelect = node.querySelector(".current-select");
    const moreSelect = node.querySelector(".more-select");
    const skillSelect = node.querySelector(".skill-select");
    const noteInput = node.querySelector(".note-input");

    currentSelect.value = existing.current || "";
    moreSelect.value = existing.more || "";
    skillSelect.value = existing.skill || "";
    noteInput.value = existing.note || "";

    node.dataset.theme = theme.name;
    node.dataset.workstream = workstream;

    const saveCurrentCard = () => saveResponse(theme.name, workstream, {
      ...existing,
      current: currentSelect.value,
      more: moreSelect.value,
      skill: skillSelect.value,
      note: noteInput.value.trim(),
    });

    currentSelect.addEventListener("change", saveCurrentCard);
    moreSelect.addEventListener("change", saveCurrentCard);
    skillSelect.addEventListener("change", saveCurrentCard);
    noteInput.addEventListener("change", saveCurrentCard);
    noteInput.addEventListener("input", saveCurrentCard);

    workstreamList.appendChild(node);
  });
}

function saveResponse(theme, workstream, value) {
  state.responses[responseKey(state.selectedPerson, workstream)] = {
    person: state.selectedPerson,
    theme,
    workstream,
    current: value.current || "",
    more: value.more || "",
    skill: value.skill || "",
    note: value.note || "",
    updatedAt: new Date().toISOString(),
  };
  saveState();
  renderSummary();
  renderTeamTable();
}

function persistVisibleWorkstreams() {
  const cards = workstreamList.querySelectorAll(".workstream-card");
  cards.forEach((card) => {
    const theme = card.dataset.theme;
    const workstream = card.dataset.workstream;
    if (!theme || !workstream) return;

    saveResponse(theme, workstream, {
      current: card.querySelector(".current-select")?.value || "",
      more: card.querySelector(".more-select")?.value || "",
      skill: card.querySelector(".skill-select")?.value || "",
      note: card.querySelector(".note-input")?.value.trim() || "",
    });
  });
}

function renderIdeas() {
  ideasList.innerHTML = "";
  if (state.ideas.length === 0) {
    ideasList.innerHTML = '<div class="empty-state">No ideas added yet.</div>';
    return;
  }

  state.ideas.forEach((idea) => {
    const card = document.createElement("article");
    card.className = "idea-card";
    card.innerHTML = `
      <div class="idea-meta">
        <span>${escapeHtml(idea.person)}</span>
        <span>${escapeHtml(idea.theme)}</span>
        <span>${new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
      <h4>${escapeHtml(idea.title)}</h4>
      <p>${escapeHtml(idea.description)}</p>
      <button class="ghost-button" data-delete-idea="${idea.id}">Delete</button>
    `;
    ideasList.appendChild(card);
  });
}

function renderTeamTable() {
  teamTableBody.innerHTML = "";
  const personFilter = teamFilterPerson.value;
  const themeFilter = teamFilterTheme.value;

  const rows = Object.values(state.responses)
    .filter((entry) => !personFilter || entry.person === personFilter)
    .filter((entry) => !themeFilter || entry.theme === themeFilter)
    .sort((a, b) => {
      if (a.person !== b.person) return a.person.localeCompare(b.person);
      if (a.theme !== b.theme) return a.theme.localeCompare(b.theme);
      return a.workstream.localeCompare(b.workstream);
    });

  if (rows.length === 0) {
    teamTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">No saved responses yet.</div>
        </td>
      </tr>
    `;
    return;
  }

  rows.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(entry.person)}</td>
      <td>${escapeHtml(entry.theme)}</td>
      <td>${escapeHtml(entry.workstream)}</td>
      <td>${escapeHtml(formatCurrentInvolvement(entry.current || ""))}</td>
      <td>${escapeHtml(entry.more || "")}</td>
      <td>${escapeHtml(entry.skill || "")}</td>
      <td>${escapeHtml(entry.note || "")}</td>
    `;
    teamTableBody.appendChild(tr);
  });
}

async function downloadState() {
  const responses = Object.values(state.responses)
    .slice()
    .sort((a, b) => {
      if (a.person !== b.person) return a.person.localeCompare(b.person);
      if (a.theme !== b.theme) return a.theme.localeCompare(b.theme);
      return a.workstream.localeCompare(b.workstream);
    });
  const ideas = state.ideas
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const workbookBytes = await buildXlsxWorkbook(responses, ideas);
  const blob = new Blob(
    [workbookBytes],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "digital-education-planning-2627.xlsx";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function buildXlsxWorkbook(responses, ideas) {
  const exportedAtIso = new Date().toISOString();
  const responseRows = [
    ["Person", "Theme", "Workstream", "Current involvement", "More involvement", "Skill growth", "Note", "Last updated"],
    ...responses.map((entry) => [
      entry.person,
      entry.theme,
      entry.workstream,
      formatCurrentInvolvement(entry.current || ""),
      entry.more || "",
      entry.skill || "",
      entry.note || "",
      entry.updatedAt ? new Date(entry.updatedAt).toLocaleString("en-GB") : "",
    ]),
  ];

  const ideaRows = [
    ["Person", "Theme", "Idea title", "Idea description", "Created"],
    ...ideas.map((idea) => [
      idea.person,
      idea.theme,
      idea.title,
      idea.description,
      idea.createdAt ? new Date(idea.createdAt).toLocaleString("en-GB") : "",
      ]),
  ];

  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>Digital Education Planning Studio</dc:creator>
  <cp:lastModifiedBy>Digital Education Planning Studio</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${exportedAtIso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${exportedAtIso}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Digital Education Planning Studio</Application>
</Properties>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr/>
  <bookViews>
    <workbookView activeTab="0"/>
  </bookViews>
  <sheets>
    <sheet name="Responses" sheetId="1" r:id="rId1"/>
    <sheet name="Ideas" sheetId="2" r:id="rId2"/>
  </sheets>
  <calcPr fullCalcOnLoad="1"/>
</workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="0"/>
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD9E7F7"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" pivotButton="0" quotePrefix="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" pivotButton="0" quotePrefix="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: buildSheetXml(responseRows),
    },
    {
      name: "xl/worksheets/sheet2.xml",
      content: buildSheetXml(ideaRows),
    },
  ];

  return createZip(files);
}

function buildSheetXml(rows) {
  const cols = Math.max(...rows.map((row) => row.length), 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${columnName(cols)}${rows.length}"/>
  <sheetViews>
    <sheetView workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>
    ${rows
      .map((row, rowIndex) => `<row r="${rowIndex + 1}">
      ${row
        .map((cell, cellIndex) => `<c r="${columnName(cellIndex + 1)}${rowIndex + 1}" t="inlineStr"${rowIndex === 0 ? ' s="1"' : ""}>
        <is><t xml:space="preserve">${xmlEscape(cell)}</t></is>
      </c>`)
        .join("")}
    </row>`)
      .join("")}
  </sheetData>
</worksheet>`;
}

function xmlEscape(value) {
  return sanitizeXmlText(String(value ?? ""))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sanitizeXmlText(value) {
  const normalized = value
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");

  let safe = "";
  for (const char of normalized) {
    const codePoint = char.codePointAt(0);
    if (
      codePoint === 0x9 ||
      codePoint === 0xa ||
      codePoint === 0xd ||
      (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
      (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
      (codePoint >= 0x10000 && codePoint <= 0x10ffff)
    ) {
      safe += char;
    }
  }

  return safe;
}

function columnName(index) {
  let name = "";
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

async function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + dataBytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  const totalSize =
    localParts.reduce((sum, part) => sum + part.length, 0) +
    centralSize +
    endRecord.length;
  const zip = new Uint8Array(totalSize);
  let cursor = 0;

  for (const part of localParts) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  zip.set(endRecord, cursor);

  return zip;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function responseKey(person, workstream) {
  return `${person}::${workstream}`;
}

function currentTheme() {
  return themes[state.currentThemeIndex];
}

function formatCurrentInvolvement(value) {
  return value === "Leading" ? "Leading or co-leading" : value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
