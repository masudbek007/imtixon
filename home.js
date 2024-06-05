const searchBooksByTitle = (title, callback) => {
    fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}`)
        .then(response => response.json())
        .then(data => callback(data));
};

const input = document.querySelector('.heder_input input');
const ulList = document.querySelector('.ulList');
const ulBlock = document.querySelector('.ulBlock');
const decadeSelect = document.getElementById('decadeSelect');
const logoutButton = document.getElementById('logoutButton');
const modal = document.getElementById('bookModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalDescription = document.getElementById('modalDescription');
const modalPublishedDate = document.getElementById('modalPublishedDate');
const closeModal = document.getElementById('closeModal');
const closeModalButton = document.getElementById('closeModalButton');
const ulRezultat = document.querySelector(".ulRezultat")
let allBooks = [];

document.addEventListener('DOMContentLoaded', loadBookmarks);

input.addEventListener('input', function() {
    const query = this.value;
    if (query.trim() !== '') {
        searchBooksByTitle(query, handleBookData);
    } else {
        ulList.innerHTML = ''; 
        displayBooks(allBooks);
    }
    ulRezultat.textContent = allBooks.length
});

function displayBooks(booksToDisplay) {
    ulList.innerHTML = ''; 
    booksToDisplay.forEach(book => {
        const li = document.createElement('li');
        li.setAttribute("class", "border-solid bg-white w-[275px] p-2 border-2 border-black-200 drop-shadow-xl mb-5");
        li.classList.add('text-left', 'py-4');
        const publishedYear = book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.split('-')[0] : 'Unknown';
        li.innerHTML = `
            <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}" class="mx-auto h-auto font-semibold mb-2">
            <h3 class="text-lg font-semibold">${book.volumeInfo.title}</h3>
            <p class="text-sm">${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author'}</p>
            <p class="text-xs text-gray-500">Published Date: ${publishedYear}</p>
            <div class="mt-[10px] flex gap-2">
                <button class="bookmark-btn bg-amber-400 hover:bg-amber-500 text-sm px-[26px] rounded-sm py-[10px] mt-[20px] font-bold">Bookmark</button>
                <button class="more-info bg-[#2a37480d] hover:bg-[#0D75FF0D] text-blue-500 text-sm px-[26px] rounded-sm py-[10px] mt-[20px] font-bold">More Info</button>
            </div>
            <button class="bookmark-btn bg-[#75828A] hover:bg-sky-500 text-[#FFFFFF] text-sm px-[26px] w-full rounded-sm py-[10px] mt-[20px] font-bold">Read</button>
        `;
        ulList.appendChild(li);

        const bookmarkBtn = li.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', () => addBookmark(book));

        const moreInfoBtn = li.querySelector('.more-info');
        moreInfoBtn.addEventListener('click', () => showModal(book));
    });
}

function handleBookData(data) {
    allBooks = data.items || [];
    if (allBooks.length > 0) {
        displayBooks(allBooks);
        populateDecades(allBooks);
        loadSelectedDecade();
    } else {
        ulList.innerHTML = '<li class="text-center py-4">Hech qandey kitob topilmadi.</li>';
    }
}

function populateDecades(books) {
    const startYear = 1800;
    const endYear = new Date().getFullYear();
    const decades = [];

    for (let year = startYear; year <= endYear; year += 50) {
        decades.push(`${year}-${year + 50}`);
    }

    decadeSelect.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'Order by newest';
    decadeSelect.appendChild(allOption);

    decades.forEach(decade => {
        const option = document.createElement('option');
        option.value = decade;
        option.textContent = decade;
        decadeSelect.appendChild(option);
    });
}

decadeSelect.addEventListener('change', function() {
    const selectedDecade = this.value.split('-').map(Number);
    if (selectedDecade.length === 2) {
        const startDecade = selectedDecade[0];
        const endDecade = selectedDecade[1];
        displayBooksByDecade(startDecade, endDecade);
        localStorage.setItem('selectedDecade', this.value);
    } else {
        displayBooks(allBooks);
        localStorage.removeItem('selectedDecade');
    }
});

function displayBooksByDecade(startDecade, endDecade) {
    const booksOfDecade = allBooks.filter(book => {
        const publishedYear = book.volumeInfo.publishedDate ? parseInt(book.volumeInfo.publishedDate.split('-')[0]) : null;
        return publishedYear >= startDecade && publishedYear <= endDecade;
    });
    if (booksOfDecade.length > 0) {
        displayBooks(booksOfDecade);
    } else {
        ulList.innerHTML = '<li class="text-center text-4xl font-bold py-4">Kitob topilmadi ?</li>';
    }
}

function loadSelectedDecade() {
    const selectedDecade = localStorage.getItem('selectedDecade');
    if (selectedDecade) {
        decadeSelect.value = selectedDecade;
        const selectedDecadeRange = selectedDecade.split('-').map(Number);
        displayBooksByDecade(selectedDecadeRange[0], selectedDecadeRange[1]);
    }
}

function addBookmark(book) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bookmarks.push(book);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    renderBookmark(book);
}

function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bookmarks.forEach(book => renderBookmark(book));
}

function renderBookmark(book) {
    const li = document.createElement('li');
    li.setAttribute("class", "border-solid bg-white w-[218px] mt-[25px] h-auto p-2 border-2 border-black-200 drop-shadow-xl mb-2");
    li.classList.add('text-left', 'py-4');
    li.innerHTML = `
        <h3 class="text-sm font-semibold">${book.volumeInfo.title}</h3>
        <p class="text-[15px] w-[150px]">${book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author'}</p>
        <div>
            <img class="ulDelete w-[27px] translate-y-[-31px] translate-x-[170px]" src="./img/delete.svg" alt="delete">
        </div>
    `;
    ulBlock.appendChild(li);

    const deleteBtn = li.querySelector('.ulDelete');
    deleteBtn.addEventListener('click', () => removeBookmark(book, li));
}

function removeBookmark(book, li) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    bookmarks = bookmarks.filter(b => b.id !== book.id);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    li.remove();
}

function showModal(book) {
    modalTitle.textContent = book.volumeInfo.title;
    modalImage.src = book.volumeInfo.imageLinks?.thumbnail || '';
    modalDescription.textContent = book.volumeInfo.description || 'No description available.';
    modalPublishedDate.textContent = `Published Date: ${book.volumeInfo.publishedDate || 'Unknown'}`;
    modal.style.display = 'flex';
}

function closeModalHandler() {
    modal.style.display = 'none';
}

closeModal.addEventListener('click', closeModalHandler);
closeModalButton.addEventListener('click', closeModalHandler);

logoutButton.addEventListener('click', function() {
    window.location.href = 'login.htm';
});


searchBooksByTitle('', handleBookData);
