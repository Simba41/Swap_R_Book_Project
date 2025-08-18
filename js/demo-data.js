export const currentUser = 
{
  id: 'u_me',
  name: 'Denis',                 
  email: 'denis@example.com',
  loc: { lat: 32.0853, lng: 34.7818 }, // Тель-Авив
  avatar: ''                     
};

// База 
export const users = 
[
  { id:'u_me',  name:'Denis',      loc:{ lat:32.0853, lng:34.7818 }, bio:'Book swapper' },
  { id:'u_ava', name:'Ava R.',     loc:{ lat:31.7683, lng:35.2137 }, bio:'Reader & collector' },
  { id:'u_noah',name:'Noah S.',    loc:{ lat:32.7940, lng:34.9896 }, bio:'Sci-fi fan' },
  { id:'u_char',name:'Charlotte',  loc:{ lat:32.1093, lng:34.8555 }, bio:'Poetry lover' }
];


export const appCategories = 
[
  'Fiction',
  'Non - Fiction',
  'Education & Reference',
  'Poetry & Drama',
  'Religion & Spirituality',
  'Travel & Adventure',
  'Lifestyle & Hobbies'
];


export const demoBooks = 
[
  {
    id:'b_emp', title:'The Light of Empires', author:'Andrew Valentine',
    cover:'images/empires.png',
    tags:['Fiction','4.7 km'], genre:'Fiction', ownerId:'u_ava',
    pickup: 'Jerusalem, Center', // место выдачи
  },

  {
    id:'b_final', title:'Final Hope', author:'Charlotte Wynn',
    cover:'images/final-hope.png',
    tags:['Science Fiction','4.1 km'], genre:'Fiction', ownerId:'u_char',
    pickup: 'Herzliya, IDC'
  },

  {
    id:'b_travel', title:'Waves & Trails', author:'Eva Stern',
    cover:'images/placeholder.png',
    tags:['Travel & Adventure'], genre:'Travel & Adventure', ownerId:'u_noah',
    pickup: 'Haifa, Downtown'
  },

  {
    id:'b_hobby', title:'Everyday Craft', author:'Leo Hart',
    cover:'images/placeholder.png',
    tags:['Lifestyle & Hobbies'], genre:'Lifestyle & Hobbies', ownerId:'u_ava',
    pickup: 'Jerusalem, Market'
  }
];

export const demoMyBooks = 
[
  { id:'b_my1', title:'My First Book', author:'Denis', cover:'images/placeholder.png', tags:['Demo'], genre:'Fiction', ownerId:'u_me', pickup: 'Tel Aviv' }
];

export const defaultCover = 'images/placeholder.png';
export const demoCategories = [...appCategories];

