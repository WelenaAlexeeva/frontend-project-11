const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const submitBtn = document.querySelector('button[type="submit"]');

export const formValidationError = (error) => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
    input.classList.add('is-invalid');
}

export const loading = (msg) => {
    feedback.classList.remove('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = msg;
    input.classList.remove('is-invalid');
    input.disabled = true;
    submitBtn.disabled = true;
}

export const loaded = (msg) => {
    feedback.classList.add('text-success');
    feedback.textContent = msg;
    submitBtn.disabled = false;
    input.disabled = false;
    input.value = '';
    input.focus();
}

export const loading_failed = (error) => {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = error;
    submitBtn.disabled = false;
    input.disabled = false;
    input.focus();
}