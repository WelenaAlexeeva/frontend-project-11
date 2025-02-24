const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const submitBtn = document.querySelector('button[type="submit"]');

export const formValidationError = (error) => {
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = error;
  input.classList.add('is-invalid');
};

export const loading = (msg) => {
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.textContent = msg;
  input.classList.remove('is-invalid');
  input.disabled = true;
  submitBtn.disabled = true;
};

export const loaded = (msg) => {
  feedback.classList.add('text-success');
  feedback.textContent = msg;
  submitBtn.disabled = false;
  input.disabled = false;
  input.value = '';
  input.focus();
};

export const renderContent = (rss, postsTitle, postsButton, feedsTitle) => {
  const posts = document.querySelector('div.posts');
  const feeds = document.querySelector('div.feeds');

  const createCard = (title) => {
    const divCard = document.createElement('div');
    divCard.classList.add('card', 'border-0');
    const divCardBody = document.createElement('div');
    divCardBody.classList.add('card-body');
    divCard.append(divCardBody);

    const h2 = document.createElement('h2');
    h2.classList.add('card-title', 'h4');
    h2.textContent = title;
    divCardBody.append(h2);

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    divCardBody.after(ul);

    return divCard;
  };

  posts.textContent = '';
  const postsCard = createCard(postsTitle);
  posts.append(postsCard);
  const ulPosts = postsCard.querySelector('ul');
  rss.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');
    if (post.isRead) a.classList.add('fw-normal');
    else a.classList.add('fw-bold');
    a.href = post.link;
    a.setAttribute('data-id', post.id);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.innerHTML = post.title;
    li.append(a);

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = postsButton;
    li.append(button);

    ulPosts.append(li);
  });

  feeds.textContent = '';
  const feedsCard = createCard(feedsTitle);
  feeds.append(feedsCard);
  const ulFeeds = feedsCard.querySelector('ul');

  rss.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3);
    li.append(p);
    ulFeeds.append(li);
  });
};

export const loadingFailed = (error) => {
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = error;
  submitBtn.disabled = false;
  input.disabled = false;
  input.focus();
};

export const postIsRead = (postId) => {
  const a = document.querySelector(`[data-id="${postId}"]`);
  a.classList.remove('fw-bold');
  a.classList.add('fw-normal');
};

export const modal = (stateModal) => {
  const modalTitle = document.querySelector('.modal-title');
  modalTitle.textContent = stateModal.title;
  const modalBody = document.querySelector('.modal-body');
  modalBody.textContent = stateModal.description;
  const a = document.querySelector('.modal-footer>a');
  a.href = stateModal.link;
};
