import logo from './logo.svg';
import React from 'react';
import './App.css';

const initialStories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    }
];

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const getAsyncStories = () => {
  return new Promise((resolve, reject) => 
    setTimeout(
      () => resolve({ data: { stories: initialStories }}),
      800
    )
  );
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state, isLoading: true, isError: false,
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state, isLoading: false, isError: false, data: action.payload,
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state, isLoading: false, isError: true,
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        )
      };
    default:
      throw new Error();
  } 
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    getAsyncStories().then(result => {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.stories,
      });
    })
    .catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE' }));
  }, []);

  const handleRemoveStory = (item) => { 
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  };

  // Callback Handler
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.data.filter((story) => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  ); 
};

const InputWithLabel = ({ id, children, value, type='text', onInputChange, isFocused}) => {

    const inputRef = React.useRef();

    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused])
    return (
      <>
        <label htmlFor={id}>{children} </label>
        <input 
          id={id}
          type={type}
          value={value}
          ref={inputRef}
          onChange={onInputChange}
        />
      </>
    );
};

const List = ({ list, onRemoveItem }) => (
    <ul>
      {list.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </ul>
);

const Item = ({ item, onRemoveItem }) => (
    <li>
      <span>
        <a href={item.url}>
          {item.title}
        </a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
);

export default App;
