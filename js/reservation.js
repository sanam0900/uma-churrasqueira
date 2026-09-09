/* ============================================================
   reservation.js — Google Sheets reservation form handler
   Replace SCRIPT_URL with your deployed Google Apps Script URL
   ============================================================ */

const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

(function () {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('resSubmit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const msg = document.getElementById('formMessage');

    // Toggle loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;
    msg.className = 'form-message';
    msg.style.display = 'none';

    const data = {
      action: 'submit',
      name:   form.name.value.trim(),
      email:  form.email.value.trim(),
      phone:  form.phone.value.trim(),
      date:   form.date.value,
      time:   form.time.value,
      guests: form.guests.value,
      notes:  form.notes.value.trim(),
    };

    // If no script URL configured, show demo success
    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      await new Promise(r => setTimeout(r, 1200));
      showSuccess(msg, data.name);
      resetBtn(btnText, btnLoading, submitBtn);
      form.reset();
      return;
    }

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      showSuccess(msg, data.name);
      form.reset();
    } catch (err) {
      msg.textContent = 'Something went wrong. Please call us at +351 932 313 032.';
      msg.className = 'form-message error';
      msg.style.display = 'block';
    } finally {
      resetBtn(btnText, btnLoading, submitBtn);
    }
  });

  function showSuccess(msg, name) {
    msg.textContent = `Thank you, ${name}! Your reservation request has been received. We'll confirm shortly.`;
    msg.className = 'form-message success';
    msg.style.display = 'block';
  }

  function resetBtn(btnText, btnLoading, submitBtn) {
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }
})();
