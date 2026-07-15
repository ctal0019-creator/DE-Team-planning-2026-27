const sampleData = window.dashboardData || { responses: [], ideas: [] };

const responsesCount = document.getElementById("responsesCount");
const peopleCount = document.getElementById("peopleCount");
const interestYesCount = document.getElementById("interestYesCount");
const interestMaybeCount = document.getElementById("interestMaybeCount");
const skillCount = document.getElementById("skillCount");
const filterPersonSelect = document.getElementById("filterPersonSelect");
const filterThemeSelect = document.getElementById("filterThemeSelect");
const filterWorkstreamSelect = document.getElementById("filterWorkstreamSelect");
const filterCurrentSelect = document.getElementById("filterCurrentSelect");
const filterMoreSelect = document.getElementById("filterMoreSelect");
const filterSkillSelect = document.getElementById("filterSkillSelect");
const responseExplorer = document.getElementById("responseExplorer");
const themeSummary = document.getElementById("themeSummary");
const personSummary = document.getElementById("personSummary");
const ideasSummary = document.getElementById("ideasSummary");
const loadSampleBtn = document.getElementById("loadSampleBtn");
const workbookInput = document.getElementById("workbookInput");

let currentDataset = { responses: [], ideas: [] };
let filterState = {
  person: "",
  theme: "",
  workstream: "",
  current: "",
  more: "",
  skill: "",
};

loadSampleBtn.addEventListener("click", () => {
  currentDataset = structuredClone(sampleData);
  renderDashboard();
});

workbookInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  currentDataset = parseWorkbookXml(text);
  renderDashboard();
  workbookInput.value = "";
});

filterPersonSelect.addEventListener("change", () => updateFilter("person", filterPersonSelect.value));
filterThemeSelect.addEventListener("change", () => updateFilter("theme", filterThemeSelect.value));
filterWorkstreamSelect.addEventListener("change", () => updateFilter("workstream", filterWorkstreamSelect.value));
filterCurrentSelect.addEventListener("change", () => updateFilter("current", filterCurrentSelect.value));
filterMoreSelect.addEventListener("change", () => updateFilter("more", filterMoreSelect.value));
filterSkillSelect.addEventListener("change", () => updateFilter("skill", filterSkillSelect.value));

currentDataset = structuredClone(sampleData);
renderDashboard();

function renderDashboard() {
  const { responses, ideas } = currentDataset;
  responsesCount.textContent = responses.length;
  peopleCount.textContent = new Set(responses.map((entry) => entry.person)).size;
  interestYesCount.textContent = responses.filter((entry) => entry.more === "Yes").length;
  interestMaybeCount.textContent = responses.filter((entry) => entry.more === "Maybe").length;
  skillCount.textContent = responses.filter((entry) => entry.skill === "Yes").length;

  renderThemeSummary(responses);
  syncExplorerFilters(responses);
  renderResponseExplorer();
  renderPersonSummary(responses);
  renderIdeas(ideas);
}

function updateFilter(key, value) {
  filterState[key] = value;
  syncExplorerFilters(currentDataset.responses);
  renderResponseExplorer();
}

function syncExplorerFilters(responses) {
  syncSelectOptions(filterPersonSelect, "person", responses, "person", "All people");
  syncSelectOptions(filterThemeSelect, "theme", responses, "theme", "All themes");
  syncSelectOptions(filterWorkstreamSelect, "workstream", responses, "workstream", "All workstreams");
  syncFixedOptions(filterCurrentSelect, "current", getSortedValues(responses, "current"), "All current involvement");
  syncFixedOptions(filterMoreSelect, "more", ["Yes", "Maybe", "No", "N/A"], "All more involvement");
  syncFixedOptions(filterSkillSelect, "skill", ["Yes", "Maybe", "No"], "All skill growth");
}

function syncSelectOptions(select, key, responses, field, allLabel) {
  const base = responses.filter((entry) => matchesOtherFilters(entry, key));
  const values = [...new Set(base.map((entry) => entry[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const nextValue = values.includes(filterState[key]) ? filterState[key] : "";

  select.innerHTML = "";
  select.add(new Option(allLabel, ""));
  values.forEach((value) => {
    select.add(new Option(value, value));
  });

  filterState[key] = nextValue;
  select.value = nextValue;
}

function syncFixedOptions(select, key, values, allLabel) {
  const allowed = values.includes(filterState[key]) ? filterState[key] : "";
  select.innerHTML = "";
  select.add(new Option(allLabel, ""));
  values.forEach((value) => {
    select.add(new Option(value, value));
  });
  filterState[key] = allowed;
  select.value = allowed;
}

function matchesOtherFilters(entry, excludedKey) {
  return Object.entries(filterState).every(([key, value]) => {
    if (key === excludedKey || !value) return true;
    return entry[key] === value;
  });
}

function getFilteredResponses() {
  return currentDataset.responses.filter((entry) =>
    Object.entries(filterState).every(([key, value]) => !value || entry[key] === value),
  );
}

function renderResponseExplorer() {
  const responses = getFilteredResponses();
  if (responses.length === 0) {
    responseExplorer.innerHTML = '<div class="empty-state">No saved responses match this selection yet.</div>';
    return;
  }

  const rows = responses
    .slice()
    .sort((a, b) => {
      if (a.person !== b.person) return a.person.localeCompare(b.person);
      if (a.theme !== b.theme) return a.theme.localeCompare(b.theme);
      return a.workstream.localeCompare(b.workstream);
    });

  responseExplorer.innerHTML = `
    <div class="section-heading">
      <h2>Filtered responses</h2>
      <p>${rows.length} matching response${rows.length === 1 ? "" : "s"}.</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Person</th>
          <th>Theme</th>
          <th>Workstream</th>
          <th>Current involvement</th>
          <th>More involvement</th>
          <th>Skill growth</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.person)}</td>
                <td>${escapeHtml(row.theme)}</td>
                <td>${escapeHtml(row.workstream)}</td>
                <td>${escapeHtml(row.current)}</td>
                <td>${escapeHtml(row.more)}</td>
                <td>${escapeHtml(row.skill)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderThemeSummary(responses) {
  if (responses.length === 0) {
    themeSummary.innerHTML = '<div class="empty-state">No response data loaded yet.</div>';
    return;
  }

  const grouped = groupBy(responses, "theme");
  const rows = Object.entries(grouped)
    .map(([theme, items]) => ({
      theme,
      responses: items.length,
      leading: items.filter((entry) => isLeading(entry.current)).length,
      interestYes: items.filter((entry) => entry.more === "Yes").length,
      interestMaybe: items.filter((entry) => entry.more === "Maybe").length,
      skill: items.filter((entry) => entry.skill === "Yes").length,
    }))
    .sort((a, b) => b.responses - a.responses);

  const maxResponses = Math.max(...rows.map((row) => row.responses), 1);

  themeSummary.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Theme</th>
          <th>Responses</th>
          <th>Current leads or co-leads</th>
          <th>More involvement: Yes</th>
          <th>More involvement: Maybe</th>
          <th>Skill growth</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${escapeHtml(row.theme)}</td>
            <td>${row.responses}</td>
            <td>${row.leading}</td>
            <td>${row.interestYes}</td>
            <td>${row.interestMaybe}</td>
            <td>${row.skill}</td>
            <td>
              <div class="bar-track">
                <div class="bar-fill" style="width:${(row.responses / maxResponses) * 100}%"></div>
              </div>
            </td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderPersonSummary(responses) {
  if (responses.length === 0) {
    personSummary.innerHTML = '<div class="empty-state">No response data loaded yet.</div>';
    return;
  }

  const grouped = groupBy(responses, "person");
  const rows = Object.entries(grouped)
    .map(([person, items]) => ({
      person,
      responses: items.length,
      leading: items.filter((entry) => isLeading(entry.current)).length,
      interestYes: items.filter((entry) => entry.more === "Yes").length,
      interestMaybe: items.filter((entry) => entry.more === "Maybe").length,
      skill: items.filter((entry) => entry.skill === "Yes").length,
    }))
    .sort((a, b) => a.person.localeCompare(b.person));

  personSummary.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Person</th>
          <th>Responses</th>
          <th>Leading or co-leading</th>
          <th>More involvement: Yes</th>
          <th>More involvement: Maybe</th>
          <th>Skill growth</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${escapeHtml(row.person)}</td>
            <td>${row.responses}</td>
            <td>${row.leading}</td>
            <td>${row.interestYes}</td>
            <td>${row.interestMaybe}</td>
            <td>${row.skill}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderIdeas(ideas) {
  if (ideas.length === 0) {
    ideasSummary.innerHTML = '<div class="empty-state">No ideas loaded yet.</div>';
    return;
  }

  ideasSummary.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Person</th>
          <th>Theme</th>
          <th>Title</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${ideas
          .map(
            (idea) => `
          <tr>
            <td>${escapeHtml(idea.person)}</td>
            <td>${escapeHtml(idea.theme)}</td>
            <td>${escapeHtml(idea.title)}</td>
            <td>${escapeHtml(idea.description)}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function parseWorkbookXml(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  const worksheets = [...xml.getElementsByTagName("Worksheet")];

  const responsesSheet = worksheets.find((sheet) => getSheetName(sheet) === "Responses");
  const ideasSheet = worksheets.find((sheet) => getSheetName(sheet) === "Ideas");

  return {
    responses: responsesSheet ? sheetToRows(responsesSheet).slice(1).map((row) => ({
      person: row[0] || "",
      theme: row[1] || "",
      workstream: row[2] || "",
      current: row[3] || "",
      more: row[4] || "",
      skill: row[5] || "",
      note: row[6] || "",
      updatedAt: row[7] || "",
    })).filter((entry) => entry.person && entry.workstream) : [],
    ideas: ideasSheet ? sheetToRows(ideasSheet).slice(1).map((row) => ({
      person: row[0] || "",
      theme: row[1] || "",
      title: row[2] || "",
      description: row[3] || "",
      createdAt: row[4] || "",
    })).filter((idea) => idea.title) : [],
  };
}

function getSheetName(sheet) {
  return sheet.getAttribute("ss:Name") || sheet.getAttribute("Name") || "";
}

function sheetToRows(sheet) {
  return [...sheet.getElementsByTagName("Row")].map((row) =>
    [...row.getElementsByTagName("Cell")].map((cell) => {
      const data = cell.getElementsByTagName("Data")[0];
      return data ? data.textContent : "";
    }),
  );
}

function getSortedValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function isLeading(value) {
  return value === "Leading" || value === "Leading or co-leading";
}

function groupBy(items, key) {
  return items.reduce((accumulator, item) => {
    const groupKey = item[key] || "Unknown";
    accumulator[groupKey] ||= [];
    accumulator[groupKey].push(item);
    return accumulator;
  }, {});
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
