import * as React from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const StyledContainer = styled.div`
  min-height: 100vh;
  height: 100%;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.li`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

  width: ${(props) => props.width};
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;
  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }
`;

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;

  svg  {
    transform: translateY(2px);
  }

  &:hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
  border-radius: 2px;
  margin-left: 10px;
`;

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  margin-right: 10px;
  font-size: 24px;
`

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;
  font-size: 24px;
`;

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

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
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', '');
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );
  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const handleFetchStories = React.useCallback(async () => {

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }

  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => { 
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    })
  };

  // Callback Handler
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      /> 

      <hr />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </StyledContainer>
  ); 
};

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
    <StyledSearchForm onSubmit={onSearchSubmit}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <StyledButtonLarge
        type="submit"
        disabled={!searchTerm}
      >
        Submit
      </StyledButtonLarge>
    </StyledSearchForm>
);

const InputWithLabel = ({ id, children, value, type='text', onInputChange, isFocused}) => {

    const inputRef = React.useRef();

    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused])
    return (
      <>
        <StyledLabel htmlFor={id}>{children} </StyledLabel>
        &nbsp;
        <StyledInput 
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
    <StyledItem>
      <StyledColumn width="40%">
        <a href={item.url}>
          {item.title}
        </a>
      </StyledColumn>
      <StyledColumn width="30%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points}</StyledColumn>
      <StyledColumn width="10%">
        <StyledButtonSmall
          type="button"
          onClick={() => onRemoveItem(item)}
        >
          <Check height="18px" width="18px" />
        </StyledButtonSmall>
      </StyledColumn>
    </StyledItem>
);

export default App;