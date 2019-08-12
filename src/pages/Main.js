import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import "./Main.css";

import api from "../services/api";

import logo from "../assets/logo.svg";
import like from "../assets/like.svg";
import dislike from "../assets/dislike.svg";
import itsamatch from "../assets/itsamatch.png";

export default function Main({ match }) {
  const [users, setUsers] = useState([]);
  const [matchDev, setMatchDev] = useState(null);

  const userLoggedId = match.params.id;

  useEffect(() => {
    async function loadUsers() {
      const response = await api.get("/devs", {
        headers: {
          user: userLoggedId
        }
      });

      setUsers(response.data);
    }

    loadUsers();
  }, [userLoggedId]);

  useEffect(() => {
    const socket = io("http://localhost:3333", {
      query: { user: userLoggedId }
    });

    socket.on("match", dev => {
      setMatchDev(dev);
    });
  }, [userLoggedId]);

  async function handleLike(id) {
    await api.post(`devs/${id}/likes`, null, {
      headers: {
        user: userLoggedId
      }
    });

    setUsers(users.filter(user => user._id !== id));
  }
  async function handleDislike(id) {
    await api.post(`devs/${id}/dislikes`, null, {
      headers: {
        user: userLoggedId
      }
    });

    setUsers(users.filter(user => user._id !== id));
  }

  return (
    <div className="main-container">
      <Link to="/">
        <img src={logo} alt="Personal Tinder" />
      </Link>
      {users.length > 0 ? (
        <ul>
          {users.map(user => (
            <li key={user._id}>
              <img src={user.avatar} alt={user.name} />
              <footer>
                <strong>{user.name}</strong>
                <p>{user.bio}</p>
              </footer>
              <div className="buttons">
                <button onClick={() => handleDislike(user._id)} type="button">
                  <img src={dislike} alt="Dislike" />
                </button>
                <button onClick={() => handleLike(user._id)} type="button">
                  <img src={like} alt="Like" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">Acabou :(</div>
      )}

      {matchDev && (
        <div className="match-container">
          <img src={itsamatch} alt="Deu Match" />
          <img className="avatar" src={matchDev.avatar} alt={matchDev.name} />
          <strong>{matchDev.name}</strong>
          <p>{matchDev.bio}</p>

          <button type="button" onClick={() => setMatchDev(null)}>
            FECHAR
          </button>
        </div>
      )}
    </div>
  );
}
