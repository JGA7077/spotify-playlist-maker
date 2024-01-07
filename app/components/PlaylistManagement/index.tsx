import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { choicedItemType } from "@/app/callback/SearchArtist";

interface PlaylistManagementProps {
  playlistManage: string;
  requestToken: string | undefined;
  choicedItemToSave: choicedItemType;
}

interface AlbumTracks {
  uri: string;
}

export default function PlaylistManagement({playlistManage, requestToken, choicedItemToSave}: PlaylistManagementProps) {
  console.log('playlistManage ==>', playlistManage);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistPublic, setPlaylistPublic] = useState(true);
  const [userPlaylist, setUserPlaylist] = useState([]);
  const router = useRouter();

  console.log('choicedItemToSave PlaylistManagement ==>', choicedItemToSave);

  const getUserId = async () => {
    try {
      const responseData = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        "Authorization": `Bearer ${requestToken}`,
      }})

      console.log('responseData ==>', responseData);

      if (!responseData.ok) {
        router.push('/');
        return
      }

      return responseData.json();
    } catch (error) {
      console.log('error ==>', error);
    }
  }

  const getPlaylistTracks = async (playlistId: string) => {
    console.log('playlistId ==>', playlistId);
    try {
      const response = await fetch(`https://api.spotify.com/v1/albums/${playlistId}/tracks`, {
        headers: {
          "Authorization": `Bearer ${requestToken}`,
        }
      })
      
      return response.json()
    } catch (error) {
      console.log('error ==>', error);
    }
  }

  const handleMountTracksUri = (tracks: AlbumTracks[]) => {
    const tracksUris = tracks.map(tracksItem => {
      return tracksItem.uri
    })

    console.log('tracksUris ==>', tracksUris);

    return tracksUris;
  }

  const teste = () => {
    handleUpdatePlaylist('6DB3k4axLkXqf0PcmZYP7b', choicedItemToSave);
  }

  const handleUpdatePlaylist = async (playlistId: string, choicedItemToSave: choicedItemType) => {
    const albumTracks = await getPlaylistTracks(choicedItemToSave.id);

    console.log('albumTracks ==>', albumTracks);

    const tracksUris = handleMountTracksUri(albumTracks.items);

    console.log('tracksUris ==>', tracksUris);

    const updateListPayload = {
      uris: tracksUris
      // range_start: tracksUris.length, // Insira a posição da primeira faixa a ser substituída (total de faixas atual na playlist)
      // insert_before: null // Insira o índice da faixa após a qual você deseja inserir as novas faixas (null para adicionar no final)
    };

    console.log('updateListPayload ==>', updateListPayload);

    try {
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${requestToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateListPayload)
      })
      .then(response => response.json())
      .then(data => {
        console.log('data handleUpdatePlaylist ==>', data);

        // if (!data.ok) {
        //   router.push('/');
        //   return
        // }
      });
    } catch (error) {
      console.log('error ==>', error);
    }
  }

  const handleCreateNewPlaylist = async () => {
    console.log('clicou handleCreateNewPlaylist ==>');

    const {id=''} = await getUserId();

    console.log('id ==>', id);

    if (!id) return;

    const createPlaylistPayload = {
      name: playlistName,
      description: playlistDescription,
      public: playlistDescription
    }

    console.log('handleCreateNewPlaylist ==>', {
      createPlaylistPayload,
      id,
      requestToken
    });

    return;

    try {
      fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${requestToken}`,
        },
        body: JSON.stringify(createPlaylistPayload)
      })
      .then(response => response.json())
      .then(data => {
        console.log('data ==>', data);

        handleUpdatePlaylist(data.id, choicedItemToSave);

        // if (!data.ok) {
        //   router.push('/');
        //   return
        // }
      });
    } catch (error) {
      console.log('error ==>', error);
    }
  }

  useEffect(() => {
    if (playlistManage === 'createList') return;

    const time1 = performance.now()

    const getUserPlaylist = () => {
      try {
        fetch('https://api.spotify.com/v1/me/playlists', {
          headers: {
            "Authorization": `Bearer ${requestToken}`,
          },
        })
        .then(response => response.json())
        .then(data => {
          console.log('data PLAYLIST ==>', data);
  
          // if (!data.ok) {
          //   router.push('/');
          //   return
          // }
        });
      } catch (error) {
        console.log('error ==>', error);
      }
    }

    getUserPlaylist()

    const time2 = performance.now()
    const total = time2 - time1

    console.log('playlistManage useEffect ==>', playlistManage);
    console.log('Tempo da segunda abordagem:', total, 'ms');
  }, [playlistManage])
  

  return (
    <div className="playlistManageButtons">
      {playlistManage === 'createList'
        ? (
          <div className="creatPlaylistContainer">
            <label htmlFor="playlistName">Informe o nome da Playlist: *</label>
            <input
              type="text"
              id="playlistName"
              placeholder="Digite o nome"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              required
            />

            <label htmlFor="playlistDescription">Informe o nome da Playlist:</label>
            <input
              type="text"
              id="playlistDescription"
              placeholder="Digite a descrição"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
            />

            <label htmlFor="playlistPublic">Informe o nome da Playlist:</label>
            <input
              type="checkbox"
              id="playlistPublic"
              placeholder="Digite a descrição"
              checked={playlistPublic}
              onChange={(e) => setPlaylistPublic(!playlistPublic)}
            />

            <button onClick={(e) => handleCreateNewPlaylist()}>Criar Playlist</button>
          </div>
        )
        : 
          <>
            <button onClick={(e) => teste()}>Atualizar Playlist</button>
          </>
        }
    </div>
  )
}