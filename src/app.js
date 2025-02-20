import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';
import {
    formValidationError,
    loading, loaded, loading_failed,
    renderContent, postIsRead
} from './view.js';
import toParse from './parser.js';




export default () => {
    const i18n = i18next.createInstance();
    i18n.init({
        lng: 'ru',
        debug: false,
        resources: {
            ru,
        }
    })
    
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
        data: {
            feeds: [],
            posts: [],
        }
    }
    
    const watchedState = onChange(state, (path) => {
        if (path === 'rssForm') {
            if (!state.rssForm.valid) formValidationError(i18n.t(state.rssForm.error));
        }
        if (path === 'loading') {
            if(state.loading.status ==='loading') loading(i18n.t('feedback.loading'));
            if(state.loading.status ==='loaded') loaded(i18n.t('feedback.loaded'));
            if(state.loading.status ==='failed') loading_failed(i18n.t(state.loading.error));
        }
        if (path === 'data') renderContent(state.data, i18n.t('feeds.title'), i18n.t('posts.title'))
        if (path.startsWith('data.posts')) {
            const postIndex = path.split('.')[2];
            postIsRead(state.data.posts[postIndex].id);
        }
    });

    const validate = (url, urls) => {
        const schema = yup.object().shape({
            url: yup
            .string()
            .trim()
            .required('feedback.errors.required')
            .url('feedback.errors.urlIncorrect')
            .notOneOf(urls, 'feedback.errors.urlAlreadyExist')
            
        });
        return schema.validate({ url }, { abortEarly: false })
        .then(() => null)
        .catch(e => e.message);
    }
    
    const load = (url) => {
        const allOriginsUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
        return fetch(`${allOriginsUrl}${url}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('feedback.errors.network');
            }
            return response.json();
        })
        .catch(e => {
            throw e;
        });
    }

    const updatePosts = (state) => {
        return Promise.all(state.validRssLinks.map(rssLink => {
            load(rssLink)
            .then(data => {
                const parsedData = toParse(data);
                const newPosts = parsedData.items.filter(item => state.data.posts.some(post => post.title === item));
                if (newPosts.length > 0) {
                    state.data = { 
                        feeds: [...watchedState.data.feeds],
                        posts: [...watchedState.data.posts, ...newPosts],
                    };
                }
            })
            .catch(() => {});
        }))
        .then(() => {
            setTimeout(() => updatePosts(state), 5000);
        });

    }

    const form = document.querySelector('.rss-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urls = watchedState.validRssLinks;
        
        validate(url, urls)
        .then(error => {
            if(error) {
                watchedState.rssForm = { valid: false, error };
            } 
            else {
                watchedState.rssForm = { valid: true, error: '' };

                watchedState.loading = { status: 'loading', error: '' }
                load(url)
                .then(data => {
                    const parsedData = toParse(data);
                    watchedState.loading = { status: 'loaded', error: '' }
                    watchedState.validRssLinks.push(url);
                    watchedState.data = { 
                        feeds: [...watchedState.data.feeds, parsedData.feed],
                        posts: [...watchedState.data.posts, ...parsedData.items],
                    };

                })
                .catch(e => {
                    watchedState.loading = { status: 'failed', error: e.message }
                })
            }   
            })
    })
    updatePosts(watchedState);

    const posts = document.querySelector('.posts');
    posts.addEventListener('click', (e) => {
        const postId = e.target.dataset.id;
        const targetPost = watchedState.data.posts.find(post => post.id === postId);
        targetPost.isRead = true;
        if (e.target.matches('button')) {
            const modalTitle = document.querySelector('.modal-title');
            modalTitle.textContent = targetPost.title;
            const modalBody =  document.querySelector('.modal-body');
            modalBody.textContent = targetPost.description;
        }

    })
}




