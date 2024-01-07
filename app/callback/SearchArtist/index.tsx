import { useRouter } from "next/navigation";
import { useState, ChangeEvent, Dispatch, SetStateAction } from "react";
import { TIME_ZONE } from "@/app/constants/timeZones";
import Pagination from "@/app/components/Pagination";
import PlaylistManagement from "@/app/components/PlaylistManagement";

interface SearchArtistProps {
  requestToken: string | undefined;
}

interface TrackListType {
  uri?: string;
  album?: {
    images?: {
      url?: string;
      height?: number;
      width?: number;
    }[] | undefined;
    name?: string;
  } | undefined;
  name?: string;
}

interface ArtistItemType {
  id: string;
  images?: {
    url?: string;
    height?: number;
    width?: number;
  }[] | undefined;
  name?: string;
}

interface InputSearchResultsType {
  id: string;
  release_date: string;
  images?: {
    url?: string;
    height?: number;
    width?: number;
  }[] | undefined;
  album?: {
    images: {
      url?: string;
      height?: number;
      width?: number;
    }[];
    release_date: string;
  };
  artists: {
    name: string;
  }[];
  name?: string;
  uri: string | '';
}

export interface choicedItemType {
  state: boolean;
  id: string;
  uri: string;
}

interface SearchItemsResponse {
  [key: string]: string;
}

export interface PaginationReqType {
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  isActive: boolean;
}

interface MappedResponsesParam {
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: [];
}

export default function SearchArtist({ requestToken }: SearchArtistProps) {
  const [topTracks, setTopTracks] = useState<TrackListType[]>([]);
  const [artistItemsResults, setArtistItemsResults] = useState<ArtistItemType[]>([]);
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [hasInputError, setHasInputError] = useState({
    inputError: ''
  });
  const [selectedSearch, setSelectedSearch] = useState('');
  const [selectedArtistItem, setSelectedArtistItem] = useState('');
  const [complementItemSearch, setComplementItemSearch] = useState('');
  const [inputSearchResults, setInputSearchResults] = useState<InputSearchResultsType[]>([]);
  const [choicedItemToSave, setChoicedItemToSave] = useState<choicedItemType>({
    state: false,
    id: '',
    uri: ''
  });
  const [noSearchResults, setNoSearchResults] = useState(false);
  const [paginationReq, setpaginationReq] = useState<PaginationReqType>({
    limit: 5,
    next: '',
    offset: 0,
    previous: null,
    total: 0,
    isActive: false
  });
  const [playlistManage, setPlaylistManage] = useState('');
  const [artistItemsResultsBkp, setArtistItemsResultsBkp] = useState<ArtistItemType[]>([])

  const router = useRouter();

  const handlePopulateSearchItems = (mappedResponses: MappedResponsesParam[]) => {
    const { limit, next, offset, previous, total } = mappedResponses[0]

    const getItemsToList = mappedResponses.map(item => item.items).flat()

    setpaginationReq({
      limit,
      next,
      offset,
      previous,
      total,
      isActive: true
    })

    setInputSearchResults(getItemsToList);
  }

  const searchItems = async (paginationOffset: number | null, itemsToSearch: string[]) => {
    const searchResultsArray: SearchItemsResponse = {
      'album': 'albums',
      'artist': 'artists',
      'track': 'tracks',
      'gender': ''
    }

    const searchItemType = selectedSearch === 'genre' || selectedSearch === 'year' ? complementItemSearch : selectedSearch;

    const itemsPromises = itemsToSearch.map(async (item) => {
      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${selectedSearch}%3A${item}&type=${searchItemType}&limit=5&offset=${paginationOffset}`, {
        headers: {
          "Authorization": `Bearer ${requestToken}`,
        }})

        return response.json();
      } catch (error) {
        if ('message' in (error as Error)) {
          const errorMessage = (error as Error).message;
          router.push('/');
          return { error: true, message: errorMessage };
        }

        return { error: true, message: `Erro na requisição: ` }
      }
    })

    const results = await Promise.all(itemsPromises);

    const hasErrorResults = results.some(item => 'error' in item);

    if (hasErrorResults) {
      router.push('/');
      return;
    }

    const indexToSearchItem = selectedSearch === 'genre' || selectedSearch === 'year' ? searchItemType : selectedSearch

    const successfullResponses = results.filter(function (item) {
      return item[searchResultsArray[indexToSearchItem]].items.length
    })

    if (!successfullResponses.length) return;

    const mappedResponses = results.map(response => {
      if (!response) {
        router.push('/');
        return;
      }

      if (!response[searchResultsArray[indexToSearchItem]].items.length) {
        setInputSearchResults([])
        setNoSearchResults(true);
        return;
      }

      const paginationParams = response[searchResultsArray[indexToSearchItem]]

      return paginationParams;
    });

    const validResponses = mappedResponses.filter(function (item) {
      return item !== undefined
    });

    if (!validResponses.length) return;

    console.log('validResponses ==>', validResponses);

    handlePopulateSearchItems(mappedResponses);
  }

  const getItemId = (paginationOffset: number | null) => {
    setHasInputError({
      inputError: ''
    });

    if (!selectedSearch) {
      setHasInputError({
        inputError: 'selectedSearch'
      });
      return;
    }

    if (!inputSearchValue) {
      setHasInputError({
        inputError: 'inputSearchValue'
      });
      return;
    }

    if ((selectedSearch === 'genre' || selectedSearch === 'year') && !complementItemSearch) {
      setHasInputError({
        inputError: 'complementItemSearch'
      });
      return;
    }

    // const itemsToSearch = inputSearchValue.split(';');
    
    searchItems(paginationOffset, [inputSearchValue]);
  }

  const handleActiveItemChoiced = (itemID: string, uri: string) => {
    setChoicedItemToSave((prevState: choicedItemType) => ({
      state: !prevState.state,
      id: !prevState.state ? itemID : '',
      uri: !prevState.state ? uri : '',
    }))
  }

  const getUserCountry = (): string | undefined => {
    const timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timezone === "" || !timezone) {
      return 'BR';
    }

    if (!TIME_ZONE) {
      return 'BR';
    }

    const timeZoneObj = TIME_ZONE[timezone];

    let _country: string | undefined

    if (timeZoneObj && 'c' in timeZoneObj) {
      _country = timeZoneObj?.c && timeZoneObj?.c.length ? timeZoneObj.c[0] : 'BR';
    }

    return _country;
  }

  const getArtistItems = () => {
    if (!selectedArtistItem) {
      setHasInputError({
        inputError: 'selectArtistItem'
      });
      return;
    }

    const userCountry = getUserCountry();

    const artistArrayResults: SearchItemsResponse = {
      'top-tracks': 'tracks',
      'albums': 'items',
      'related-artists': 'artists'
    }

    fetch(`https://api.spotify.com/v1/artists/${choicedItemToSave.id}/${selectedArtistItem}?country=${userCountry}`, {
      headers: {
        "Authorization": `Bearer ${requestToken}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('data getArtistItems ==>', data);
        if (selectedArtistItem !== 'top-tracks') {
          const albumsResponse = data[artistArrayResults[selectedArtistItem]];

          if (albumsResponse.length > 5) {
            setArtistItemsResultsBkp(albumsResponse);
          }

          const hasLimitResponse = albumsResponse.length > 5 
            ? albumsResponse.slice(0, 5) 
            : albumsResponse
          
          setArtistItemsResults(hasLimitResponse);
          setTopTracks([])
          return;
        }

        setArtistItemsResults([]);
        setTopTracks(data[artistArrayResults[selectedArtistItem]])
      })
  }

  const handleChangeSelectSearch = (e: ChangeEvent<HTMLSelectElement>, setState: Dispatch<SetStateAction<string>>) => {

    setState(e.target.value);
    setInputSearchResults([]);
    setArtistItemsResults([]);
    setpaginationReq({
      limit: 5,
      next: null,
      offset: 0,
      previous: null,
      total: 0,
      isActive: false
    })

    if (topTracks.length) setTopTracks([])
  };

  const handleShowYear = (item: InputSearchResultsType) => {
    if (complementItemSearch === 'track') return item?.album?.release_date.substring(0, 4);
    return item?.release_date.substring(0, 4)
  };

  const handleShowMoreAlbums = () => {
    const sliceIndex = artistItemsResults.length + 5;

    setArtistItemsResults(artistItemsResultsBkp.slice(0, sliceIndex));
  };

  return (
    <>
      <div>
        <div className="inputBox fieldToSearch">
          <label htmlFor="fieldToSearch">Select a search option:</label>
          <select
            id="fieldToSearch"
            onChange={(e) => handleChangeSelectSearch(e, setSelectedSearch)}
            required
          >
            <option value=""></option>
            <option value="album">Album</option>
            <option value="artist">Artist</option>
            <option value="track">Track</option>
            <option value="genre">Musical Genre</option>
            <option value="year">Year</option>
          </select>
          {hasInputError.inputError === 'selectedSearch' && (
            <span className="errorMessage">You must select an option.</span>
          )}
        </div>

        <div className="inputBox artistSearchBox">
          <label htmlFor="searchIdItem">What are you looking for?</label>
          <input
            type="text"
            id="searchIdItem"
            placeholder="Type what you want..."
            value={inputSearchValue}
            onChange={(e) => setInputSearchValue(e.target.value)}
            required
          />

          {hasInputError.inputError === 'inputSearchValue' && (
            <span className="errorMessage">You must provide at least one item.</span>
          )}

          <p>Search Tips:</p>

          <ul>
            {/* <li>If there is more than one item, enter the names separated by semicolons ';'.</li> */}
            <li>For cases that have more than one result per item, select the desired one when the results appear.</li>
          </ul>
        </div>

        {selectedSearch === 'genre' || selectedSearch === 'year' ? (
          <div className="inputBox fieldToSearch">
            <label htmlFor="complementSearch">Select what you are looking for from the genre/year:</label>
            <select
              id="complementSearch"
              onChange={(e) => handleChangeSelectSearch(e, setComplementItemSearch)}
              required
            >
              <option value=""></option>
              {selectedSearch === 'year' ? <option value="album">Albums</option> : null}
              <option value="artist">Artists</option>
              <option value="track">Tracks</option>
            </select>
            {hasInputError.inputError === 'complementItemSearch' && (
              <span className="errorMessage">You must select an option.</span>
            )}
          </div>
        ) : null}

        <button onClick={(e) => getItemId(0)}>Search</button>

        <div className="resultSearchList">
          <>
            {inputSearchResults.length
              ? inputSearchResults.map(item => (
                  <div
                    key={item?.id}
                    className="resultSearchList_item"
                    onClick={() => handleActiveItemChoiced(item?.id, item?.uri)}
                    style={{
                      display: (choicedItemToSave.state && choicedItemToSave.id === item?.id) || choicedItemToSave.id === '' ? 'flex' : 'none'
                    }}
                  >
                    {item?.images
                      ? <img
                        src={item?.images[1]?.url}
                        alt={item?.name}
                      />
                      : null
                    }
                    {item?.album
                      ? <img
                        src={item?.album?.images[1]?.url || ''}
                        alt={item?.name}
                      />
                      : null
                    }
                    {selectedSearch === 'year' && complementItemSearch !== 'artist' && handleShowYear(item)}
                    {item?.artists ? <span>{item?.artists[0].name}</span> : null}
                    <span>&nbsp;-&nbsp;{item?.name}</span>
                  </div>
              ))
              : null
            }

          </>

          {noSearchResults && !choicedItemToSave.state && <span>The searched item could not be found.</span>}
        </div>

        {selectedSearch === 'artist' && choicedItemToSave.state && choicedItemToSave.id 
        ? (
          <div className="inputBox fieldToSearch">
            <label htmlFor="artistItemToSearch">Select what you are looking for from the artist:</label>
            <select
              id="artistItemToSearch"
              onChange={(e) => setSelectedArtistItem(e.target.value)}
              required
            >
              <option value=""></option>
              <option value="albums">Albums</option>
              <option value="top-tracks">Top Tracks</option>
              <option value="related-artists">Related Artists</option>
            </select>
            {hasInputError.inputError === 'selectArtistItem' && (
              <span className="errorMessage">You must select an option.</span>
            )}

            <button onClick={getArtistItems}>Search</button>
          </div>
        )
        : paginationReq.total !== 0 ? (
          <>
            <Pagination paginationReq={paginationReq} getItemId={getItemId} />
          </>
        ) : null}
      </div>

      <div className="tracksList">
        {topTracks.length
          ? topTracks.map(track => (
            <div key={track.uri} className="searchItem">
              {track?.album?.images
                ? <img src={track?.album?.images[1].url} alt={track?.album?.name} />
                : null
              }
              <span>Music: {track?.name}</span>
            </div>
          )) : null}
      </div>

      <div className="artistItemsList">
        {artistItemsResults.length
          ? 
            <>
              {artistItemsResults.map(item => (
                <div key={item.id} className="searchItem">
                  {item?.images
                    ? <img src={item?.images[1].url} alt={item?.name} />
                    : null
                  }
                  <span>{item?.name}</span>
                </div>
              ))}

              {artistItemsResultsBkp.length 
                ? (
                  <button
                    disabled={artistItemsResultsBkp.length === artistItemsResults.length}
                    onClick={handleShowMoreAlbums}
                  >See more</button> 
                )
                : null
              }
            </>
          : null}
      </div>

      {artistItemsResults.length || paginationReq.total !== 0 ? (
        <div className="playlistManagement">
          <form>
            <label htmlFor="createList">
              <input 
                type="radio" 
                id="createList" 
                name="playlistManagement" 
                value="createList"
                onChange={() => setPlaylistManage('createList')}
              />
              Create Playlist
            </label>
            <label htmlFor="updateList">
              <input 
                type="radio" 
                id="updateList" 
                name="playlistManagement" 
                value="updateList"
                onChange={() => setPlaylistManage('updateList')}
              />
              Update Playlist
            </label>
          </form>

          {
            playlistManage 
              ? <PlaylistManagement playlistManage={playlistManage} requestToken={requestToken} choicedItemToSave={choicedItemToSave} />
              : null
          }
      </div>
      ) : null}
    </>
  )
}