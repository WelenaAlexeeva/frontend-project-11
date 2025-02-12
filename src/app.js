import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';
import {
    formValidationError,
    loading, loaded, loading_failed
} from './view.js';


export default () => {
    const i18nInstance = i18next.createInstance();
    i18nInstance.init({
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
        }
    }
    
    const watchedState = onChange(state, (path) => {
        if (path === 'rssForm') {
            if (!state.rssForm.valid) formValidationError(state.rssForm.error);
        }
        if (path === 'loading.status') {
            if(state.loading.status ==='loading') loading(i18nInstance.t('feedback.loading'));
            if(state.loading.status ==='loaded') loaded(i18nInstance.t('feedback.loaded'));
            if(state.loading.status ==='failed') loading_failed(state.loading.error)
            }
    });

    const validate = (url, urls) => {
        const schema = yup.object().shape({
            url: yup
            .string()
            .trim()
            .required(i18nInstance.t('feedback.errors.required'))
            .url(i18nInstance.t('feedback.errors.urlIncorrect'))
            .notOneOf(urls, i18nInstance.t('feedback.errors.urlAlreadyExist'))
            
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
                throw new Error(i18nInstance.t('feedback.errors.network'));
            }
            return response.json();
        })
        .catch(e => {
            throw e;
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
    
                watchedState.loading.status = 'loading';
                load(url)
                .then(data => {
                    watchedState.loading.status = 'loaded';
                    watchedState.validRssLinks.push(url);
                    console.log('data', data);
                })
                .catch(e => {
                    watchedState.loading.status = 'failed';
                    watchedState.loading.error = e.message;
                })
            }   
            })
    })
}




