(function () {
  "use strict";

  const data = window.HOMEPAGE_DATA || {};
  const DATA_SOURCE_KEYS = ["githubContributions", "dailySteps", "annualSongs2025"];
  const DATASET_CONFIGS = {
    githubContributions: {
      unit: "contributions",
      labels: ["date", "day", "label"],
      values: ["count", "contributions", "amount", "value"]
    },
    dailySteps: {
      unit: "steps",
      labels: ["date", "day", "label"],
      values: ["steps", "count", "amount", "value"]
    },
    annualSongs2025: {
      unit: "",
      labels: ["song", "title", "track", "name", "label"],
      values: ["times", "amount", "plays", "count", "value"],
      notes: ["author", "artist", "artists", "note", "notes", "description"],
      links: ["url", "link", "website", "spotify"]
    }
  };
  const FAVORITE_QUESTIONS_CONFIG = {
    labels: ["query", "question", "prompt", "label"],
    answers: ["answer", "response", "value"]
  };
  const STEP_CHART_HEIGHT = 178;
  const STEP_CHART_BOTTOM_OFFSET = 34;

  const state = {
    profilePage: "identity",
    profileImageIndex: 0,
    profileImages: [],
    favoriteQuestions: [],
    favoriteQuestionIndex: -1,
    surpriseColors: [],
    surpriseImageSource: "",
    surpriseImageObjectUrl: "",
    surpriseGlassTimer: 0,
    currentSongUrl: "",
    songRecommendations: []
  };

  const palette = ["#6fa6bf", "#85a867", "#8d8ab8", "#e5a47c", "#587a4e", "#f7f2df"];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function cleanDisplay(value) {
    return value === undefined || value === null ? "" : String(value).trim();
  }

  function setText(selector, value, fallback) {
    const node = $(selector);
    if (!node) return;
    node.textContent = cleanText(value) || fallback;
  }

  function renderSite() {
    setText("#siteTitle", data.site?.title, "My Data Atelier");
  }

  function renderProfile() {
    const profile = data.profile || {};
    const image = profile.image || {};

    setText("#introTitle", profile.sectionTitle, "Profile");
    state.profileImages = resolveProfileImages(image);
    state.profileImageIndex = Math.max(state.profileImages.indexOf(cleanText(image.src)), 0);

    const captionNode = $("#imageCaption");
    const imageCaption = cleanText(image.caption) || "Click the image to view others.";
    if (captionNode) {
      captionNode.textContent = imageCaption;
      captionNode.hidden = false;
    }

    const imageNode = $("#profileImage");
    if (imageNode) {
      const imageSrc = state.profileImages[state.profileImageIndex] || cleanText(image.src);
      if (imageSrc) {
        imageNode.src = imageSrc;
        imageNode.alt = cleanText(image.alt) || "Profile representative image";
        imageNode.hidden = false;
        imageNode.tabIndex = state.profileImages.length > 1 ? 0 : -1;
        imageNode.setAttribute("role", state.profileImages.length > 1 ? "button" : "img");
        imageNode.setAttribute("aria-label", `${imageNode.alt}. Click to change image.`);
      } else {
        imageNode.removeAttribute("src");
        imageNode.alt = "";
        imageNode.hidden = true;
      }
    }

    renderProfileIdentity(profile);
    renderProfileIntro(profile);
    renderProfilePage();
  }

  function resolveProfileImages(image) {
    const imageSrc = cleanText(image.src);
    const candidates = Array.isArray(image.candidates) ? image.candidates.map(cleanText).filter(Boolean) : [];
    return uniqueStrings([imageSrc, ...candidates]).filter(Boolean);
  }

  function uniqueStrings(values) {
    return Array.from(new Set(values));
  }

  function renderProfileIdentity(profile) {
    const identityNode = $("#profileIdentity");
    if (!identityNode) return;

    const details = [
      ["Name / Nickname", cleanDisplay([profile.name,profile.nickname].join(" / ")) || "Name/Nickname pending"],
      ["Age", cleanDisplay(profile.age) || "Age pending"],
      ["Institute", cleanDisplay(profile.institute) || "Institute pending"],
      ["Major", cleanDisplay(profile.major) || "Major pending"]
    ];

    identityNode.innerHTML = details
      .map(
        ([label, value]) => `
          <div class="detail-row">
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value)}</dd>
          </div>
        `
      )
      .join("");
  }

  function renderProfileIntro(profile) {
    const introPanel = $("#profileIntro");
    if (!introPanel) return;

    const source = profile.favoriteQuestions || {};
    const items = normalizeFavoriteQuestions(source);
    state.favoriteQuestions = items;

    const button = $("#favoriteQuestionButton");
    if (button) {
      button.disabled = !items.length;
    }

    if (!items.length) {
      state.favoriteQuestionIndex = -1;
      renderFavoriteQuestion(null, csvEmptyMessage(source, "Q&A pairs pending."));
      return;
    }

    if (state.favoriteQuestionIndex < 0 || state.favoriteQuestionIndex >= items.length) {
      state.favoriteQuestionIndex = 0;
    }

    renderFavoriteQuestion(items[state.favoriteQuestionIndex]);
  }

  function normalizeFavoriteQuestions(source) {
    const rows = Array.isArray(source?.items) ? source.items : [];

    return rows
      .map((item) => {
        const label = cleanDisplay(firstDefined(item.label, item.query, item.question, item.prompt));
        const answer = cleanDisplay(firstDefined(item.answer, item.response, item.value, item.note));
        return { label, answer };
      })
      .filter((item) => item.label && item.answer);
  }

  function renderFavoriteQuestion(item, fallback = "Q&A pairs pending.") {
    const questionNode = $("#favoriteQuestionText");
    const answerNode = $("#favoriteAnswer");
    if (!questionNode || !answerNode) return;

    if (!item) {
      questionNode.textContent = "___";
      answerNode.textContent = fallback;
      answerNode.dataset.empty = "true";
      return;
    }

    questionNode.textContent = item.label;
    answerNode.textContent = item.answer;
    answerNode.dataset.empty = "false";
  }

  function renderProfilePage() {
    $$(".profile-page").forEach((panel) => {
      const isActive =
        (state.profilePage === "identity" && panel.id === "profileIdentity") ||
        (state.profilePage === "intro" && panel.id === "profileIntro");
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    $$("[data-profile-page]").forEach((button) => {
      const isActive = button.dataset.profilePage === state.profilePage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function renderVisualization() {
    const visual = getVisualization();
    const sources = visual.sources || {};

    setText("#dataTitle", visual.title, "Data Visualization");

    const songItems = normalizeDataSeries(sources.annualSongs2025);
    renderContributionGrid(normalizeDataSeries(sources.githubContributions), sources.githubContributions);
    renderDailyStepsChart(normalizeDataSeries(sources.dailySteps), sources.dailySteps);
    renderAnnualSongsChart(songItems, sources.annualSongs2025);
    updateSongRecommender(songItems, sources.annualSongs2025);
  }

  function getVisualization() {
    data.visualization = data.visualization || {};
    data.visualization.sources = data.visualization.sources || {};
    DATA_SOURCE_KEYS.forEach((key) => {
      data.visualization.sources[key] = data.visualization.sources[key] || {};
    });
    return data.visualization;
  }

  async function loadVisualizationData() {
    const visual = getVisualization();
    const profile = data.profile || {};
    data.profile = profile;

    DATA_SOURCE_KEYS.forEach((key) => {
      visual.sources[key] = {
        ...visual.sources[key],
        loading: true,
        missing: false,
        error: "",
        items: []
      };
    });
    profile.favoriteQuestions = {
      ...profile.favoriteQuestions,
      loading: true,
      missing: false,
      error: "",
      items: []
    };
    renderProfileIntro(profile);
    renderVisualization();

    const loadedSources = await Promise.all(
      DATA_SOURCE_KEYS.map((key) => loadStaticDataSource(visual.sources[key], DATASET_CONFIGS[key]))
    );

    DATA_SOURCE_KEYS.forEach((key, index) => {
      visual.sources[key] = loadedSources[index];
    });

    profile.favoriteQuestions = await loadStaticTextSource(profile.favoriteQuestions, FAVORITE_QUESTIONS_CONFIG);

    renderProfileIntro(profile);
    renderVisualization();
  }

  async function loadStaticDataSource(source, config) {
    const csvName = cleanText(source?.csv);
    const nextSource = {
      ...source,
      unit: cleanText(source?.unit) || cleanText(config?.unit),
      loading: false,
      missing: false,
      error: "",
      items: []
    };

    if (!csvName) {
      nextSource.error = "CSV path is missing.";
      return nextSource;
    }

    nextSource.csv = csvName;
    const result = await fetchStaticCsv(csvName);
    if (result.missing || result.error) {
      nextSource.missing = result.missing;
      nextSource.error = result.error;
      return nextSource;
    }

    nextSource.items = csvToDataItems(result.text, config);
    return nextSource;
  }

  async function loadStaticTextSource(source, config) {
    const csvName = cleanText(source?.csv);
    const nextSource = {
      ...source,
      loading: false,
      missing: false,
      error: "",
      items: []
    };

    if (!csvName) {
      nextSource.error = "CSV path is missing.";
      return nextSource;
    }

    nextSource.csv = csvName;
    const result = await fetchStaticCsv(csvName);
    if (result.missing || result.error) {
      nextSource.missing = result.missing;
      nextSource.error = result.error;
      return nextSource;
    }

    nextSource.items = csvToTextItems(result.text, config);
    return nextSource;
  }

  async function fetchStaticCsv(csvName) {
    try {
      const response = await fetch(csvName, {
        headers: {
          Accept: "text/csv,text/plain,*/*"
        },
        cache: "no-store"
      });

      if (response.status === 404) {
        return { text: "", missing: true, error: "" };
      }
      if (!response.ok) {
        return { text: "", missing: false, error: `CSV request failed with ${response.status}.` };
      }

      return { text: await response.text(), missing: false, error: "" };
    } catch (error) {
      const filePreviewHint = window.location.protocol === "file:" ? " Use a local static server instead of opening index.html directly." : "";
      return { text: "", missing: false, error: `Static CSV unavailable.${filePreviewHint}` };
    }
  }

  function csvToDataItems(text, config) {
    const rows = parseCsvRows(text);
    if (!rows.length) return [];

    const header = rows[0].map((cell) => cleanText(cell).toLowerCase());
    const labelIndex = findColumn(header, config.labels);
    const valueIndex = findColumn(header, config.values);
    const noteIndex = findColumn(header, config.notes || ["note", "notes", "description"]);
    const linkIndex = findColumn(header, config.links || ["url", "link", "website"]);
    const hasHeader = labelIndex >= 0 || valueIndex >= 0 || noteIndex >= 0 || linkIndex >= 0;
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const resolvedLabelIndex = labelIndex >= 0 ? labelIndex : 0;
    const resolvedValueIndex = valueIndex >= 0 ? valueIndex : 1;

    return dataRows
      .map((row) => {
        const label = cleanDisplay(getCsvCell(row, resolvedLabelIndex));
        const value = parseCsvNumber(getCsvCell(row, resolvedValueIndex));
        if (!label || !Number.isFinite(value)) return null;

        const item = { label, value };
        const note = noteIndex >= 0 ? cleanDisplay(getCsvCell(row, noteIndex)) : "";
        const url = linkIndex >= 0 ? cleanDisplay(getCsvCell(row, linkIndex)) : "";
        if (note) item.note = note;
        if (url) item.url = url;
        return item;
      })
      .filter(Boolean);
  }

  function csvToTextItems(text, config) {
    const rows = parseCsvRows(text);
    if (!rows.length) return [];

    const header = rows[0].map((cell) => cleanText(cell).toLowerCase());
    const labelIndex = findColumn(header, config.labels);
    const answerIndex = findColumn(header, config.answers);
    const hasHeader = labelIndex >= 0 || answerIndex >= 0;
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const resolvedLabelIndex = labelIndex >= 0 ? labelIndex : 0;
    const resolvedAnswerIndex = answerIndex >= 0 ? answerIndex : 1;

    return dataRows
      .map((row) => {
        const label = cleanDisplay(getCsvCell(row, resolvedLabelIndex));
        const answer = cleanDisplay(getCsvCell(row, resolvedAnswerIndex));
        return label && answer ? { label, answer } : null;
      })
      .filter(Boolean);
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    const source = String(text || "").replace(/^\uFEFF/, "");

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const nextChar = source[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") index += 1;
        row.push(field);
        if (row.some((cell) => cleanText(cell))) rows.push(row);
        row = [];
        field = "";
        continue;
      }

      field += char;
    }

    row.push(field);
    if (row.some((cell) => cleanText(cell))) rows.push(row);
    return rows;
  }

  function findColumn(header, names) {
    const matchedName = names.find((name) => header.includes(name));
    return matchedName ? header.indexOf(matchedName) : -1;
  }

  function getCsvCell(row, index) {
    return index >= 0 && index < row.length ? row[index] : "";
  }

  function normalizeDataSeries(source) {
    const rows = Array.isArray(source?.items) ? source.items : [];

    return rows
      .map((item) => {
        const label = cleanText(firstDefined(item.label, item.date, item.song, item.title, item.name, ""));
        const rawValue = firstDefined(item.value, item.count, item.steps, item.times, item.plays, item.amount);
        const value = typeof rawValue === "number" ? rawValue : parseCsvNumber(rawValue);
        return {
          label,
          value,
          note: cleanText(item.note),
          url: cleanText(firstDefined(item.url, item.link, item.website, item.spotify, ""))
        };
      })
      .filter((item) => item.label && Number.isFinite(item.value));
  }

  function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null);
  }

  function renderContributionGrid(items, source) {
    const grid = $("#githubContributionGrid");
    if (!grid) return;

    const rows = items;

    if (!rows.length) {
      grid.classList.add("is-empty");
      grid.innerHTML = renderContributionChart({
        weekCount: 5,
        months: "",
        cells: placeholderCells(35, "contribution-cell is-empty")
      });
      grid.setAttribute("aria-label", "GitHub contribution heatmap awaiting CSV data");
      setupContributionTooltip(grid);
      return;
    }

    const max = Math.max(...rows.map((item) => item.value), 1);
    const chart = buildContributionChart(rows, max, cleanText(source?.unit));
    grid.classList.remove("is-empty");
    grid.setAttribute("aria-label", "GitHub-style contribution heatmap for all logged days");
    grid.innerHTML = renderContributionChart(chart);
    setupContributionTooltip(grid);
    scrollContributionGridToEnd(grid);
  }

  function scrollContributionGridToEnd(grid) {
    window.requestAnimationFrame(() => {
      const scroll = grid.querySelector(".contribution-scroll") || grid;
      scroll.scrollLeft = scroll.scrollWidth;
    });
  }

  function contributionLevel(value, max) {
    if (value <= 0) return 0;
    const ratio = value / max;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  }

  function buildContributionChart(rows, max, unit) {
    const datedRows = rows
      .map((item) => ({
        ...item,
        date: parseDateLabel(item.label)
      }))
      .filter((item) => item.date);

    if (datedRows.length !== rows.length) {
      return {
        weekCount: Math.max(Math.ceil(rows.length / 7), 1),
        months: "",
        cells: rows.map((item) => renderContributionCell(item, max, unit)).join("")
      };
    }

    datedRows.sort((a, b) => a.date - b.date);
    const startDate = startOfContributionWeek(datedRows[0].date);
    const endDate = datedRows[datedRows.length - 1].date;
    const weekCount = Math.max(Math.ceil((diffDays(startDate, endDate) + 1) / 7), 1);
    const rowsByDate = new Map(datedRows.map((item) => [dateKey(item.date), item]));
    const cellCount = weekCount * 7;
    const cells = Array.from({ length: cellCount }, (_, index) => {
      const date = addDays(startDate, index);
      const item = rowsByDate.get(dateKey(date));
      return item ? renderContributionCell(item, max, unit) : `<span class="contribution-cell is-empty" aria-hidden="true"></span>`;
    }).join("");

    return {
      weekCount,
      months: renderContributionMonthTicks(startDate, cellCount),
      cells
    };
  }

  function renderContributionCell(item, max, unit) {
    const level = contributionLevel(item.value, max);
    const message = `${item.label}: ${formatValue(item.value, unit)}`;
    return `
      <span
        class="contribution-cell level-${level}"
        tabindex="0"
        data-tooltip="${escapeHtml(message)}"
        aria-label="${escapeHtml(message)}"
      ></span>
    `;
  }

  function renderContributionChart({ weekCount, months, cells }) {
    return `
      <div class="contribution-chart" style="--contribution-weeks: ${weekCount};">
        <div class="contribution-days" aria-hidden="true">
          <span></span>
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
        </div>
        <div class="contribution-scroll">
          <div class="contribution-months" aria-hidden="true">${months}</div>
          <div class="contribution-cells">${cells}</div>
        </div>
        <span class="contribution-chart-tooltip" role="tooltip" aria-hidden="true"></span>
      </div>
    `;
  }

  function setupContributionTooltip(grid) {
    if (grid.dataset.tooltipBound === "true") return;
    grid.dataset.tooltipBound = "true";
    grid.addEventListener("mouseover", handleContributionTooltipShow);
    grid.addEventListener("focusin", handleContributionTooltipShow);
    grid.addEventListener("mouseout", handleContributionTooltipHide);
    grid.addEventListener("focusout", handleContributionTooltipHide);
    grid.addEventListener("scroll", hideContributionTooltipFromEvent, true);
  }

  function handleContributionTooltipShow(event) {
    const cell = findContributionCell(event.target);
    if (!cell) return;
    showContributionTooltip(event.currentTarget, cell);
  }

  function handleContributionTooltipHide(event) {
    const cell = findContributionCell(event.target);
    if (!cell || cell.contains(event.relatedTarget)) return;
    hideContributionTooltip(event.currentTarget);
  }

  function hideContributionTooltipFromEvent(event) {
    hideContributionTooltip(event.currentTarget);
  }

  function findContributionCell(target) {
    return target instanceof Element ? target.closest(".contribution-cell[data-tooltip]") : null;
  }

  function showContributionTooltip(grid, cell) {
    const chart = grid.querySelector(".contribution-chart");
    const tooltip = grid.querySelector(".contribution-chart-tooltip");
    const message = cleanText(cell.dataset.tooltip);
    if (!chart || !tooltip || !message) return;

    const chartRect = chart.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const x = cellRect.left - chartRect.left + cellRect.width / 2;
    const y = cellRect.top - chartRect.top - 8;

    tooltip.textContent = message;
    tooltip.style.left = `${clampTooltipX(chart, tooltip, x)}px`;
    tooltip.style.top = `${Math.max(y, 10)}px`;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideContributionTooltip(grid) {
    const tooltip = grid.querySelector(".contribution-chart-tooltip");
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function renderContributionMonthTicks(startDate, cellCount) {
    let previousMonth = -1;
    return Array.from({ length: cellCount }, (_, index) => {
      const date = addDays(startDate, index);
      const month = date.getUTCMonth();
      if (month === previousMonth) return "";
      previousMonth = month;
      return `
        <span class="contribution-month" style="grid-column: ${Math.floor(index / 7) + 1};">
          ${escapeHtml(formatMonthLabel(date))}
        </span>
      `;
    }).join("");
  }

  function parseDateLabel(label) {
    const match = cleanText(label).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function startOfContributionWeek(date) {
    return addDays(date, -date.getUTCDay());
  }

  function addDays(date, days) {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  function diffDays(start, end) {
    return Math.round((end - start) / 86400000);
  }

  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function formatMonthLabel(date) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()];
  }

  function renderDailyStepsChart(items, source) {
    const chart = $("#dailyStepsChart");
    if (!chart) return;

    const rows = items.slice(-30);
    chart.style.setProperty("--step-count", String(rows.length || 30));

    if (!rows.length) {
      chart.classList.add("is-empty");
      chart.innerHTML = `
        ${renderStepYAxisTicks(1)}
        <div class="vertical-bar-scroll">
          ${placeholderCells(30, "vertical-bar-slot is-empty")}
        </div>
      `;
      chart.setAttribute("aria-label", "Daily steps vertical bar chart awaiting CSV data");
      scrollStepChartToEnd(chart);
      return;
    }

    const unit = cleanText(source?.unit) || "steps";
    const max = Math.max(...rows.map((item) => item.value), 1);
    const xTickIndexes = new Set(sparseTickIndexes(rows.length));
    chart.classList.remove("is-empty");
    chart.setAttribute("aria-label", "Daily steps vertical bar chart for the past month");
    chart.innerHTML =
      renderStepYAxisTicks(max) +
      `<div class="vertical-bar-scroll">` +
        rows
          .map((item, index) => {
          const height = Math.max((item.value / max) * 100, 2);
          const message = `${item.label}: ${formatValue(item.value, unit)}`;
          return `
            <div class="vertical-bar-slot" tabindex="0" data-tooltip="${escapeHtml(message)}" aria-label="${escapeHtml(message)}">
              <span class="vertical-bar-track" aria-hidden="true">
                <span class="vertical-bar-fill" style="--bar-height: ${height}%;"></span>
              </span>
              ${xTickIndexes.has(index) ? `<span class="chart-x-tick" aria-hidden="true">${escapeHtml(formatTickDate(item.label))}</span>` : ""}
              <span class="sr-only">${escapeHtml(`${item.label}: ${formatValue(item.value, unit)}`)}</span>
            </div>
          `;
          })
          .join("") +
      `</div>
      <span class="chart-tooltip" role="tooltip" aria-hidden="true"></span>`;
    setupStepChartTooltip(chart);
    scrollStepChartToEnd(chart);
  }

  function scrollStepChartToEnd(chart) {
    window.requestAnimationFrame(() => {
      const scroll = chart.querySelector(".vertical-bar-scroll");
      if (scroll) scroll.scrollLeft = scroll.scrollWidth;
    });
  }

  function setupStepChartTooltip(chart) {
    if (chart.dataset.tooltipBound === "true") return;
    chart.dataset.tooltipBound = "true";
    chart.addEventListener("mouseover", handleStepTooltipShow);
    chart.addEventListener("focusin", handleStepTooltipShow);
    chart.addEventListener("mouseout", handleStepTooltipHide);
    chart.addEventListener("focusout", handleStepTooltipHide);
    chart.addEventListener("scroll", hideStepTooltipFromEvent, true);
  }

  function handleStepTooltipShow(event) {
    const slot = findStepSlot(event.target);
    if (!slot) return;
    showStepTooltip(event.currentTarget, slot);
  }

  function handleStepTooltipHide(event) {
    const slot = findStepSlot(event.target);
    if (!slot || slot.contains(event.relatedTarget)) return;
    hideStepTooltip(event.currentTarget);
  }

  function hideStepTooltipFromEvent(event) {
    hideStepTooltip(event.currentTarget);
  }

  function findStepSlot(target) {
    return target instanceof Element ? target.closest(".vertical-bar-slot[data-tooltip]") : null;
  }

  function showStepTooltip(chart, slot) {
    const tooltip = chart.querySelector(".chart-tooltip");
    const message = cleanText(slot.dataset.tooltip);
    if (!tooltip || !message) return;

    const chartRect = chart.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const x = slotRect.left - chartRect.left + slotRect.width / 2;
    const y = slotRect.top - chartRect.top - 8;

    tooltip.textContent = message;
    tooltip.style.left = `${clampTooltipX(chart, tooltip, x)}px`;
    tooltip.style.top = `${Math.max(y, 10)}px`;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideStepTooltip(chart) {
    const tooltip = chart.querySelector(".chart-tooltip");
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function renderStepYAxisTicks(max) {
    const values = uniqueNumbers([0, max / 2, max]);
    return `
      <div class="chart-y-ticks" aria-hidden="true">
        ${values
          .map((value) => {
            const bottom = STEP_CHART_BOTTOM_OFFSET + (value / Math.max(max, 1)) * STEP_CHART_HEIGHT;
            return `
              <span class="chart-y-tick" style="--tick-bottom: ${bottom}px;">
                <span>${escapeHtml(formatAxisNumber(value))}</span>
              </span>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function uniqueNumbers(values) {
    return Array.from(new Set(values.map((value) => Math.round(value)))).sort((a, b) => a - b);
  }

  function axisTickValues(max, intervals) {
    return uniqueNumbers(
      Array.from({ length: intervals + 1 }, (_, index) => (Math.max(max, 1) * index) / intervals)
    );
  }

  function sparseTickIndexes(count) {
    if (count <= 0) return [];
    if (count === 1) return [0];
    if (count <= 8) return [0, count - 1];
    return [0, Math.floor((count - 1) / 2), count - 1];
  }

  function formatTickDate(label) {
    const text = cleanText(label);
    const match = text.match(/^\d{4}-(\d{2})-(\d{2})$/);
    return match ? `${match[1]}-${match[2]}` : text;
  }

  function formatAxisNumber(value) {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
    }
    return String(Math.round(value));
  }

  function renderAnnualSongsChart(items, source) {
    const chart = $("#annualSongsChart");
    if (!chart) return;

    if (!items.length) {
      const message = csvEmptyMessage(source, "Song CSV data pending.");
      chart.classList.add("is-empty");
      chart.innerHTML = `<p class="empty-state">${escapeHtml(message)}</p>`;
      chart.setAttribute("aria-label", "Annual song list horizontal bar chart awaiting CSV data");
      return;
    }

    const unit = cleanText(source?.unit);
    const max = Math.max(...items.map((item) => item.value), 1);
    chart.classList.remove("is-empty");
    chart.setAttribute("aria-label", "Annual song list horizontal bar chart for 2025");
    chart.innerHTML =
      renderSongXAxisTicks(max) +
      items
        .map((item) => {
        const width = Math.max((item.value / max) * 100, 4);
        const author = cleanText(item.note);
        const valueText = formatValue(item.value, unit);
        const tooltipValueText = formatValue(item.value, unit || "playing count");
        const message = author ? `${item.label} - ${author}: ${tooltipValueText}` : `${item.label}: ${tooltipValueText}`;
        return `
          <div class="song-bar-row" tabindex="0" data-tooltip="${escapeHtml(message)}" aria-label="${escapeHtml(message)}">
            <span class="song-text">
              <span class="song-title">${escapeHtml(item.label)}</span>
              ${author ? `<span class="song-author">${escapeHtml(author)}</span>` : ""}
            </span>
            <span class="song-bar-track" aria-hidden="true">
              <span class="song-bar-fill" style="--bar-width: ${width}%;"></span>
            </span>
            <span class="song-count">${valueText}</span>
          </div>
        `;
        })
        .join("") +
      `<span class="chart-tooltip" role="tooltip" aria-hidden="true"></span>`;
    setupSongChartTooltip(chart);
  }

  function setupSongChartTooltip(chart) {
    if (chart.dataset.songTooltipBound === "true") return;
    chart.dataset.songTooltipBound = "true";
    chart.addEventListener("mouseover", handleSongTooltipShow);
    chart.addEventListener("focusin", handleSongTooltipShow);
    chart.addEventListener("mouseout", handleSongTooltipHide);
    chart.addEventListener("focusout", handleSongTooltipHide);
  }

  function handleSongTooltipShow(event) {
    const row = findSongRow(event.target);
    if (!row) return;
    showSongTooltip(event.currentTarget, row);
  }

  function handleSongTooltipHide(event) {
    const row = findSongRow(event.target);
    if (!row || row.contains(event.relatedTarget)) return;
    hideSongTooltip(event.currentTarget);
  }

  function findSongRow(target) {
    return target instanceof Element ? target.closest(".song-bar-row[data-tooltip]") : null;
  }

  function showSongTooltip(chart, row) {
    const tooltip = chart.querySelector(".chart-tooltip");
    const track = row.querySelector(".song-bar-track") || row;
    const message = cleanText(row.dataset.tooltip);
    if (!tooltip || !message) return;

    const chartRect = chart.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const x = trackRect.left - chartRect.left + trackRect.width / 2;
    const y = trackRect.top - chartRect.top - 8;

    tooltip.textContent = message;
    tooltip.style.left = `${clampTooltipX(chart, tooltip, x)}px`;
    tooltip.style.top = `${Math.max(y, 10)}px`;
    tooltip.classList.add("is-visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideSongTooltip(chart) {
    const tooltip = chart.querySelector(".chart-tooltip");
    if (!tooltip) return;
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function clampTooltipX(container, tooltip, x) {
    const padding = 8;
    const availableHalfWidth = Math.max(container.clientWidth / 2 - padding, 0);
    const halfWidth = Math.min(tooltip.offsetWidth / 2, availableHalfWidth);
    const minX = halfWidth + padding;
    const maxX = Math.max(container.clientWidth - halfWidth - padding, minX);
    return Math.min(Math.max(x, minX), maxX);
  }

  function renderSongXAxisTicks(max) {
    const values = axisTickValues(max, 5);
    return `
      <div class="song-axis" aria-hidden="true">
        <span></span>
        <div class="song-axis-scale">
          ${values
            .map((value) => {
              const left = (value / Math.max(max, 1)) * 100;
              return `
                <span class="song-axis-tick" style="--tick-left: ${left}%;">
                  <span>${escapeHtml(formatAxisNumber(value))}</span>
                </span>
              `;
            })
            .join("")}
        </div>
        <span class="song-axis-label">Playing Count</span>
      </div>
    `;
  }

  function placeholderCells(count, className) {
    return Array.from({ length: count }, () => `<span class="${className}" aria-hidden="true"></span>`).join("");
  }

  function csvEmptyMessage(source, fallback) {
    const csvName = cleanText(source?.csv);

    if (source?.loading) return csvName ? `Loading ${csvName}.` : "Loading CSV.";
    if (cleanText(source?.error)) return cleanText(source.error);
    if (source?.missing) return csvName ? `${csvName} has not been written yet.` : "CSV file has not been written yet.";
    return fallback;
  }

  function formatValue(value, unit) {
    const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(1);
    return `${normalized}${unit ? ` ${escapeHtml(unit)}` : ""}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setupThemeToggle() {
    const button = $("#themeToggle");
    if (!button) return;

    const savedTheme = readStoredTheme();
    if (savedTheme === "dark" || savedTheme === "light") {
      document.documentElement.dataset.theme = savedTheme;
    }

    button.setAttribute("aria-pressed", document.documentElement.dataset.theme === "dark" ? "true" : "false");

    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      writeStoredTheme(nextTheme);
      button.setAttribute("aria-pressed", nextTheme === "dark" ? "true" : "false");
    });
  }

  function readStoredTheme() {
    try {
      return window.localStorage.getItem("homepage-theme");
    } catch (error) {
      return "";
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem("homepage-theme", theme);
    } catch (error) {
      // Direct file previews can disable storage; the theme still changes for the current page.
    }
  }

  function parseCsvNumber(value) {
    return Number(cleanText(value).replaceAll(",", ""));
  }

  function setupProfileSelector() {
    $$("[data-profile-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.profilePage = button.dataset.profilePage || "identity";
        renderProfilePage();
      });
    });
  }

  function setupFavoriteQuestionPicker() {
    const button = $("#favoriteQuestionButton");
    if (!button) return;

    button.addEventListener("click", pickFavoriteQuestion);
  }

  function pickFavoriteQuestion() {
    if (!state.favoriteQuestions.length) return;

    state.favoriteQuestionIndex = (state.favoriteQuestionIndex + 1) % state.favoriteQuestions.length;
    renderFavoriteQuestion(state.favoriteQuestions[state.favoriteQuestionIndex]);
  }

  function setupProfileImageCycle() {
    const imageNode = $("#profileImage");
    if (!imageNode) return;

    imageNode.addEventListener("click", cycleProfileImage);
    imageNode.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      cycleProfileImage();
    });
  }

  function cycleProfileImage() {
    const imageNode = $("#profileImage");
    if (!imageNode || state.profileImages.length <= 1) return;

    state.profileImageIndex = (state.profileImageIndex + 1) % state.profileImages.length;
    imageNode.src = state.profileImages[state.profileImageIndex];
  }

  function setupEasterEgg() {
    const button = $("#sparkButton");
    const range = $("#energyRange");
    const input = $("#surpriseImageInput");
    const recommendButton = $("#songRecommendButton");
    const playButton = $("#songPlayButton");
    const imageSrc = cleanText(data.easterEgg?.image?.src) || "surprise/figure0.jpeg";

    if (!button) return;

    loadSurpriseImageSource(imageSrc);

    if (input) {
      input.addEventListener("change", handleSurpriseImageUpload);
    }

    button.addEventListener("click", () => {
      document.body.classList.toggle("is-awake");
      launchParticles(Number(range?.value || 3));
    });

    if (recommendButton) {
      recommendButton.addEventListener("click", recommendRandomSong);
    }
    if (playButton) {
      playButton.addEventListener("click", playCurrentSong);
    }
  }

  function loadSurpriseImageSource(src) {
    const preview = $("#surpriseImagePreview");
    const imageSrc = cleanText(src);
    if (!preview || !imageSrc) {
      setSurpriseColors(palette.slice(0, 4));
      return;
    }

    preview.src = imageSrc;
    state.surpriseImageSource = imageSrc;

    const sampler = new Image();
    sampler.addEventListener("load", () => {
      if (state.surpriseImageSource === imageSrc) {
        updateSurpriseColorsFromImage(sampler);
      }
    }, { once: true });
    sampler.addEventListener("error", () => {
      if (state.surpriseImageSource === imageSrc) {
        setSurpriseColors(palette.slice(0, 4));
      }
    }, { once: true });
    sampler.src = imageSrc;
  }

  function updateSongRecommender(items, source) {
    state.songRecommendations = items;
    const button = $("#songRecommendButton");
    const result = $("#songRecommendation");
    if (!button || !result) return;

    const unavailable = !items.length;
    button.disabled = unavailable;

    if (unavailable) {
      state.currentSongUrl = "";
      updateSongPlayButton(null);
      const message = csvEmptyMessage(source, "Song list pending.");
      result.innerHTML = `
        <span class="recommend-title">${escapeHtml(message)}</span>
        <span class="recommend-author">Recommendation pending</span>
      `;
    } else if (!result.dataset.hasRecommendation) {
      state.currentSongUrl = "";
      updateSongPlayButton(null);
      result.innerHTML = `
        <span class="recommend-title">${items.length} songs ready</span>
        <span class="recommend-author">Press the button to choose one</span>
      `;
    }
  }

  function recommendRandomSong() {
    const result = $("#songRecommendation");
    if (!result || !state.songRecommendations.length) return;

    const index = Math.floor(Math.random() * state.songRecommendations.length);
    const song = state.songRecommendations[index];
    state.currentSongUrl = cleanText(song.url);
    updateSongPlayButton(song);
    result.dataset.hasRecommendation = "true";
    result.innerHTML = `
      <span class="recommend-title">${escapeHtml(song.label)}</span>
      <span class="recommend-author">${escapeHtml(song.note || "Unknown artist")}</span>
    `;
  }

  function updateSongPlayButton(song) {
    const button = $("#songPlayButton");
    if (!button) return;

    const url = cleanText(song?.url);
    button.disabled = !url;
    button.title = url ? `Open ${song.label} on Spotify` : "Pick a song first";
  }

  function playCurrentSong() {
    if (!state.currentSongUrl) return;
    window.open(state.currentSongUrl, "_blank", "noopener,noreferrer");
  }

  function handleSurpriseImageUpload(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    const preview = $("#surpriseImagePreview");
    if (!file || !preview || !file.type.startsWith("image/")) return;

    if (state.surpriseImageObjectUrl) {
      URL.revokeObjectURL(state.surpriseImageObjectUrl);
    }

    state.surpriseImageObjectUrl = URL.createObjectURL(file);
    loadSurpriseImageSource(state.surpriseImageObjectUrl);
  }

  function updateSurpriseColorsFromImage(image) {
    setSurpriseColors(sampleImageColors(image, 5));
  }

  function sampleImageColors(image, count) {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context || !image.naturalWidth || !image.naturalHeight) return palette.slice(0, count);

      canvas.width = 56;
      canvas.height = 56;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map();
      for (let index = 0; index < pixels.length; index += 16) {
        const alpha = pixels[index + 3];
        if (alpha < 160) continue;

        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const key = [red, green, blue].map((value) => Math.min(Math.round(value / 32) * 32, 255)).join(",");
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }

      const colors = Array.from(buckets.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => rgbToHex(...key.split(",").map(Number)))
        .filter((color, index, list) => list.findIndex((item) => colorDistance(item, color) < 42) === index)
        .slice(0, count);

      return colors.length ? colors : palette.slice(0, count);
    } catch (error) {
      return palette.slice(0, count);
    }
  }

  function setSurpriseColors(colors) {
    state.surpriseColors = colors.length ? colors : palette.slice(0, 4);
    renderSurpriseSwatches();
  }

  function renderSurpriseSwatches() {
    const swatches = $("#surpriseSwatches");
    if (!swatches) return;

    swatches.innerHTML = state.surpriseColors
      .map((color) => `<span class="surprise-swatch" style="--swatch-color: ${color};" aria-hidden="true"></span>`)
      .join("");
  }

  function rgbToHex(red, green, blue) {
    return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  function colorDistance(first, second) {
    const a = hexToRgb(first);
    const b = hexToRgb(second);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }

  function hexToRgb(color) {
    const value = color.replace("#", "");
    return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
  }

  function launchParticles(level) {
    const count = Math.min(Math.max(level, 1), 5) * 8;
    const colors = state.surpriseColors.length ? state.surpriseColors : [palette[0], palette[1], palette[2], palette[4]];
    const width = window.innerWidth;
    const height = window.innerHeight;
    let longestDuration = 0;

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      const fromLeft = index % 2 === 0;
      const startX = fromLeft ? -24 : width + 24;
      const startY = Math.round(height * (0.16 + Math.random() * 0.38));
      const direction = fromLeft ? 1 : -1;
      const horizontalTravel = Math.round(width * (0.32 + Math.random() * 0.46));
      const midX = Math.round(direction * horizontalTravel * 0.58);
      const midY = Math.round(-height * (0.08 + Math.random() * 0.12));
      const endX = Math.round(direction * horizontalTravel);
      const endY = Math.round(height - startY + 80 + Math.random() * 160);
      const size = Math.round(9 + Math.random() * 9);
      const spin = Math.round((fromLeft ? 1 : -1) * (180 + Math.random() * 260));
      const duration = Math.round(1050 + Math.random() * 420);
      longestDuration = Math.max(longestDuration, duration);

      particle.className = "particle";
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.setProperty("--mid-x", `${midX}px`);
      particle.style.setProperty("--mid-y", `${midY}px`);
      particle.style.setProperty("--end-x", `${endX}px`);
      particle.style.setProperty("--end-y", `${endY}px`);
      particle.style.setProperty("--mid-spin", `${Math.round(spin * 0.42)}deg`);
      particle.style.setProperty("--spin", `${spin}deg`);
      particle.style.setProperty("--particle-size", `${size}px`);
      particle.style.setProperty("--particle-duration", `${duration}ms`);
      particle.style.setProperty("--particle-color", colors[index % colors.length]);

      document.body.appendChild(particle);
      window.setTimeout(() => particle.remove(), duration + 80);
    }

    activateSurpriseGlass(longestDuration + 180);
  }

  function activateSurpriseGlass(duration) {
    const glass = $(".surprise-glass");
    document.body.classList.add("is-surprise-falling");
    if (glass) {
      glass.style.setProperty("--glass-duration", `${duration}ms`);
    }
    window.clearTimeout(state.surpriseGlassTimer);
    state.surpriseGlassTimer = window.setTimeout(() => {
      document.body.classList.remove("is-surprise-falling");
    }, duration);
  }

  renderSite();
  renderProfile();
  renderVisualization();
  setupThemeToggle();
  setupProfileSelector();
  setupFavoriteQuestionPicker();
  setupProfileImageCycle();
  loadVisualizationData();
  setupEasterEgg();
})();
