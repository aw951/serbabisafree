
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Tahun otomatis di footer.
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Jalankan kalkulator yang sesuai dengan halaman.
  const calculator = document.querySelector("[data-tool]");
  if (!calculator) return;

  const form = calculator.querySelector("form");
  const result = calculator.querySelector(".result");
  const error = calculator.querySelector(".error-message");

  if (!form || !result || !error) return;

  const money = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 2
    }).format(value);

  const number = (value) =>
    new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 4
    }).format(value);

  function showResult(title, main, details = []) {
    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = title;
    result.appendChild(heading);

    const mainText = document.createElement("p");
    mainText.className = "result-main";
    mainText.textContent = main;
    result.appendChild(mainText);

    details.forEach((detail) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = detail;
      result.appendChild(paragraph);
    });

    result.hidden = false;
    error.textContent = "";
  }

  function showError(message) {
    error.textContent = message;
    result.hidden = true;
  }

  function getValue(name) {
    const input = form.elements.namedItem(name);
    if (!input) return NaN;
    return input.value.trim() === "" ? NaN : Number(input.value);
  }

  function validNonNegative(...values) {
    return values.every((value) => Number.isFinite(value) && value >= 0);
  }

  function clearOutput() {
    error.textContent = "";
    result.hidden = true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearOutput();

    const tool = calculator.dataset.tool;

    if (tool === "diskon") {
      const price = getValue("harga");
      const discount = getValue("diskon");

      if (!validNonNegative(price, discount) || discount > 100) {
        showError("Masukkan harga minimal 0 dan diskon antara 0–100%.");
        return;
      }

      const saved = price * discount / 100;
      const finalPrice = price - saved;

      showResult("Hasil perhitungan", money(finalPrice), [
        "Harga awal: " + money(price),
        "Potongan: " + money(saved),
        "Diskon: " + number(discount) + "%"
      ]);
    }

    if (tool === "persentase") {
      const mode = form.elements.namedItem("mode").value;
      const first = getValue("angka1");
      const second = getValue("angka2");

      if (!Number.isFinite(first) || !Number.isFinite(second)) {
        showError("Isi kedua kolom dengan angka yang valid.");
        return;
      }

      if (mode === "bagian") {
        if (first < 0 || second < 0) {
          showError("Gunakan angka 0 atau lebih untuk perhitungan ini.");
          return;
        }

        const value = first / 100 * second;
        showResult("Hasil persentase", number(value), [
          number(first) + "% dari " + number(second) + " adalah " + number(value) + "."
        ]);
      } else if (mode === "perubahan") {
        if (first === 0) {
          showError("Angka awal tidak boleh 0 untuk menghitung perubahan persentase.");
          return;
        }

        const change = ((second - first) / Math.abs(first)) * 100;
        const label = change > 0
          ? "Kenaikan"
          : change < 0
            ? "Penurunan"
            : "Tidak ada perubahan";

        showResult("Perubahan persentase", number(Math.abs(change)) + "%", [
          label + " dari " + number(first) + " ke " + number(second) + ".",
          "Selisih angka: " + number(second - first)
        ]);
      }
    }

    if (tool === "umur") {
      const birthValue = form.elements.namedItem("tanggalLahir").value;
      const targetValue = form.elements.namedItem("tanggalHitung").value;

      if (!birthValue || !targetValue) {
        showError("Pilih tanggal lahir dan tanggal perhitungan.");
        return;
      }

      const birth = parseDate(birthValue);
      const target = parseDate(targetValue);

      if (!birth || !target || target < birth) {
        showError("Tanggal perhitungan harus sama dengan atau setelah tanggal lahir.");
        return;
      }

      const age = calculateAge(birth, target);

      showResult("Hasil umur", age.years + " tahun", [
        age.months + " bulan dan " + age.days + " hari",
        "Tanggal perhitungan: " + formatDate(target)
      ]);
    }
  });

  // Hindari masalah zona waktu dengan membuat tanggal lokal.
  function parseDate(value) {
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
      return null;
    }

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function calculateAge(birth, target) {
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const previousMonth = (target.getMonth() - 1 + 12) % 12;
      const previousYear = target.getMonth() === 0
        ? target.getFullYear() - 1
        : target.getFullYear();

      days += daysInMonth(previousYear, previousMonth);
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  form.addEventListener("reset", () => {
    clearOutput();
  });
});
