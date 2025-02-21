import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './styles.css';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';
import {
  formValidationError,
  loading, loaded, loadingFailed,
  renderContent, postIsRead, modal,
} from './view.js';
import toParse from './parser.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
    },
  })
    .then(() => {
      console.log('i18n инициализирован успешно');
    })
    .catch((e) => {
      console.error('Ошибка при инициализации i18n:', e);
    });

  const state = {
    rssForm: {
      valid: false,
      error: '',
    },
    validRssLinks: [],
    loading: {
      status: 'idle',
      error: null,
    },
    modal: '',
    data: {
      feeds: [],
      posts: [],
    },
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'rssForm') {
      if (!state.rssForm.valid) formValidationError(i18n.t(state.rssForm.error));
    }
    if (path === 'loading') {
      if (state.loading.status === 'loading') loading(i18n.t('feedback.loading'));
      if (state.loading.status === 'loaded') loaded(i18n.t('feedback.loaded'));
      if (state.loading.status === 'failed') loadingFailed(i18n.t(state.loading.error));
    }
    if (path === 'data') {
      renderContent(
        state.data,
        i18n.t('posts.title'),
        i18n.t('posts.button'),
        i18n.t('feeds.title'),
      );
    }
    if (path.startsWith('data.posts')) {
      const postIndex = path.split('.')[2];
      postIsRead(state.data.posts[postIndex].id);
    }
    if (path === 'modal') modal(state.modal);
  });

  const validate = (url, urls) => {
    const schema = yup.object().shape({
      url: yup
        .string()
        .trim()
        .required('feedback.errors.required')
        .url('feedback.errors.urlIncorrect')
        .notOneOf(urls, 'feedback.errors.urlAlreadyExist'),

    });
    return schema.validate({ url }, { abortEarly: false })
      .then(() => null)
      .catch((e) => {
        throw e;
      });
  };

  const load = (url) => {
    const allOriginsUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
    const networkTimeout = 5000;
    return fetch(
      `${allOriginsUrl}${url}`,
      { signal: AbortSignal.timeout(networkTimeout) },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('feedback.errors.network');
        }
        return response.json();
      })
      .catch(() => {
        throw new Error('feedback.errors.network');
      });
  };

  const updatePosts = () => {
    Promise.all(watchedState.validRssLinks.map((rssLink) => load(rssLink)
      .then((data) => {
        const parsedData = toParse(data);
        const newPosts = parsedData.items.filter((item) => watchedState.data.posts.some((post) => post.title === item));
        if (newPosts.length > 0) {
          watchedState.data = {
            feeds: [...watchedState.data.feeds],
            posts: [...watchedState.data.posts, ...newPosts],
          };
        }
      })
      .catch(() => {})))
      .then(() => {
        const updateInterval = 5000;
        setTimeout(() => updatePosts(state), updateInterval);
      });
  };

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urls = watchedState.validRssLinks;

    validate(url, urls)
      .then(() => {
        watchedState.rssForm = { valid: true, error: '' };

        watchedState.loading = { status: 'loading', error: '' };
        load(url)
          .then((data) => {
            const parsedData = toParse(data);
            watchedState.loading = { status: 'loaded', error: '' };
            watchedState.validRssLinks.push(url);
            watchedState.data = {
              feeds: [...watchedState.data.feeds, parsedData.feed],
              posts: [...watchedState.data.posts, ...parsedData.items],
            };
            updatePosts();
          })
          .catch((err) => {
            watchedState.loading = { status: 'failed', error: err.message };
          });
      })
      .catch((err) => {
        watchedState.rssForm = { valid: false, error: err.message };
      });
  });

  const posts = document.querySelector('.posts');
  posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    const targetPost = watchedState.data.posts.find((post) => post.id === postId);
    targetPost.isRead = true;
    if (e.target.matches('button')) {
      watchedState.modal = targetPost;
    }
  });
};
