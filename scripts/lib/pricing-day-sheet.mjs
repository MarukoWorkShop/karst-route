/**
 * 按日一行 ↔ days[].lines（只点选产品；价在产品库）
 */

function mealLine(ref, label) {
  if (!ref) return null;
  return {
    type: "meal",
    split: "per_person",
    ref,
    label: { zh: label, en: label },
    adultApplicable: true,
    childApplicable: true,
  };
}

export function expandDaySheetRow(row) {
  const day = Number(row.day) || 0;
  const titleZh = row.titleZh || row.title || "";
  const titleEn = row.titleEn || titleZh;
  const lines = [];
  const push = (line) => {
    if (line) lines.push(line);
  };

  if (row.hotelRef) {
    push({
      type: "hotel",
      split: "per_room_split",
      ref: row.hotelRef,
      rooms: row.rooms > 0 ? row.rooms : 1,
      adultApplicable: true,
      childApplicable: false,
    });
  }

  for (const ref of [row.vehicleARef, row.vehicleBRef]) {
    if (!ref) continue;
    push({
      type: "vehicle",
      split: "per_vehicle_split",
      ref,
      adultApplicable: true,
      childApplicable: true,
    });
  }

  if (row.guideRef) {
    push({
      type: "guide",
      split: "per_group_split",
      ref: row.guideRef,
      adultApplicable: true,
      childApplicable: true,
    });
  }

  push(mealLine(row.breakfastRef, "早餐"));
  push(mealLine(row.lunchRef, "中餐"));
  push(mealLine(row.dinnerRef, "晚餐"));

  for (const t of [
    { ref: row.ticket1Ref, pay: row.ticket1PayOnSite },
    { ref: row.ticket2Ref, pay: row.ticket2PayOnSite },
  ]) {
    if (!t.ref) continue;
    push({
      type: "ticket",
      split: "per_person",
      ref: t.ref,
      payOnSite: !!t.pay,
      adultApplicable: true,
      childApplicable: true,
    });
  }

  if (row.tipRef) {
    push({
      type: "tip",
      split: "per_person",
      ref: row.tipRef,
      label: { zh: "小费", en: "Tip" },
      adultApplicable: true,
      childApplicable: true,
    });
  }

  const seenMisc = new Set(row.tipRef ? [row.tipRef] : []);
  for (const ref of Array.isArray(row.miscRefs) ? row.miscRefs : []) {
    if (!ref || seenMisc.has(ref)) continue;
    seenMisc.add(ref);
    push({
      type: "other",
      split: "per_person",
      ref,
      adultApplicable: true,
      childApplicable: true,
    });
  }

  return { day, title: { zh: titleZh, en: titleEn }, lines };
}

export function flattenDay(day) {
  const row = {
    day: day.day,
    titleZh: day.title?.zh || "",
    titleEn: day.title?.en || day.title?.zh || "",
    hotelRef: "",
    rooms: 1,
    vehicleARef: "",
    vehicleBRef: "",
    guideRef: "",
    breakfastRef: "",
    lunchRef: "",
    dinnerRef: "",
    ticket1Ref: "",
    ticket2Ref: "",
    ticket1PayOnSite: false,
    ticket2PayOnSite: false,
    tipRef: "",
    miscRefs: [],
  };

  const tickets = [];
  const vehicles = [];

  for (const line of day.lines || []) {
    if (line.type === "hotel") {
      row.hotelRef = line.ref || "";
      row.rooms = line.rooms || 1;
    } else if (line.type === "vehicle") vehicles.push(line);
    else if (line.type === "guide") row.guideRef = line.ref || "";
    else if (line.type === "ticket") tickets.push(line);
    else if (line.type === "meal") {
      const label = line.label?.zh || "";
      if (label.includes("早")) row.breakfastRef = line.ref || "";
      else if (label.includes("晚")) row.dinnerRef = line.ref || "";
      else row.lunchRef = line.ref || "";
    } else if (line.type === "tip") row.tipRef = line.ref || "";
    else if ((line.type === "other" || line.type === "visa") && line.ref) {
      row.miscRefs.push(line.ref);
    }
  }

  if (vehicles[0]) row.vehicleARef = vehicles[0].ref || "";
  if (vehicles[1]) row.vehicleBRef = vehicles[1].ref || "";
  if (tickets[0]) {
    row.ticket1Ref = tickets[0].ref || "";
    row.ticket1PayOnSite = !!tickets[0].payOnSite;
  }
  if (tickets[1]) {
    row.ticket2Ref = tickets[1].ref || "";
    row.ticket2PayOnSite = !!tickets[1].payOnSite;
  }
  return row;
}
