import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object().shape({
    url: yup
    .string()
    .trim()
    .required('Поле обязательно для заполнения')
    .url('Введите корректный URL')
    
});


const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');
const submitBtn = document.querySelector('.rss-submit-btn');
const feedback = document.querySelector('.feedback');

const state = {
    rssForm: {
      valid: true,
      data: {
        url: '',
      },
      error: '',
    },
    validRssLinks: [],
  }


const allOriginsUrl = 'https://api.allorigins.win/get?url=';

const watchedState = onChange(state, (path) => {
    if (path === 'rssForm.error') {
        feedback.classList.remove('text-success');
        feedback.classList.add('text-danger');
        feedback.textContent = state.rssForm.error;
    }
    if (path === 'validRssLinks') {
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        feedback.textContent = 'RSS успешно загружен';
        input.value = '';
        input.focus();
    }
})


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.rssForm.data['url'] = url;

    schema.validate({ url }, { abortEarly: false })
    .then((data) => fetch(`${allOriginsUrl}${data.url}`))
    .then(response => {
        if (!response.ok) {
            throw new Error('Проблемы сети');
        }
        if (watchedState.validRssLinks.includes(url)) {
            throw new Error('RSS уже существует');
        }
        watchedState.validRssLinks.push(url);
        return response.json();
    })
    .then(data => console.log('Data:', data))
    .catch((err) => {
        watchedState.rssForm.valid = false;
        watchedState.rssForm.error = err.message;
        console.error(err.message);
    });
})