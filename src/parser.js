import _ from 'lodash';

const toParse = (data) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/xml');
    if (!doc.querySelector('rss')) {
        throw new Error('feedback.errors.parser');
    }
    const feedTitle = doc.querySelector('title').textContent;
    const feedDescription = doc.querySelector('description').textContent;
    const feedId = _.uniqueId();
    const feed = { id: feedId, title: feedTitle, description: feedDescription }
    const rss = { feed, items: [] };

    const items = doc.querySelectorAll('item');
    items.forEach((item) => {
        const id = _.uniqueId();
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        const isRead = false;
        rss.items.push({ id, title, link, description, feedId, isRead })
    });
    return rss;
};

export default toParse;
