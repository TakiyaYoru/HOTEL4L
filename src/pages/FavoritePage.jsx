import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';

const FavoriteSection = styled.section`
  padding: 80px 0;
`;

const FavoriteRoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FavoriteCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const RoomImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  object-position: center;
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: center;
  padding: 20px;
`;

const RoomName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1e1e1e;
`;

const RoomPrice = styled.div`
  font-size: 1.8rem;
  color: #b8860b;
  font-weight: 700;
  margin-bottom: 15px;
  display: flex;
  align-items: baseline;
  justify-content: center;

  span {
    font-size: 1rem;
    color: #777;
    font-weight: 400;
    margin-left: 5px;
  }
`;

const FavoriteToggle = styled.div`
  cursor: pointer;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
`;

const ViewButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 12px 0;
  background-color: transparent;
  color: #b8860b;
  border: 2px solid #b8860b;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;

  &:hover {
    background-color: #b8860b;
    color: white;
  }
`;

const FavoritePage = () => {
  const [favoriteRooms, setFavoriteRooms] = useState(JSON.parse(localStorage.getItem('favoriteRooms')) || []);

  useEffect(() => {
    setFavoriteRooms(JSON.parse(localStorage.getItem('favoriteRooms')) || []);
  }, []);

  const handleFavoriteToggle = (room) => {
    let updatedFavorites = [...favoriteRooms];

    if (updatedFavorites.some(favRoom => favRoom.id === room.id)) {
      updatedFavorites = updatedFavorites.filter(favRoom => favRoom.id !== room.id);
    } else {
      updatedFavorites.push(room);
    }

    // Cập nhật lại localStorage
    localStorage.setItem('favoriteRooms', JSON.stringify(updatedFavorites));
    setFavoriteRooms(updatedFavorites);
  };

  return (
    <div className="container">
      <FavoriteSection>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Your Favorite Rooms</h2>
        <FavoriteRoomsGrid>
          {favoriteRooms.length > 0 ? (
            favoriteRooms.map((room) => (
              <FavoriteCard key={room.id}>
                <RoomImage src={room.images[0]} alt={room.name} />
                <RoomInfo>
                  <RoomName>{room.name}</RoomName>
                  <RoomPrice>
                    ${room.price}<span>/ night</span>
                  </RoomPrice>
                  <FavoriteToggle onClick={() => handleFavoriteToggle(room)}>
                    <FaHeart color="red" size={24} />
                  </FavoriteToggle>
                  <ViewButton to={`/rooms/${room.id}`}>
                    View Details
                  </ViewButton>
                </RoomInfo>
              </FavoriteCard>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0' }}>
              <h3 style={{ marginBottom: '15px' }}>No Favorite Rooms Yet</h3>
              <p style={{ marginBottom: '20px', color: '#777' }}>Browse our rooms and add some to your favorites.</p>
              <ViewButton to="/rooms" style={{ display: 'inline-block' }}>
                Browse Rooms
              </ViewButton>
            </div>
          )}
        </FavoriteRoomsGrid>
      </FavoriteSection>
    </div>
  );
};

export default FavoritePage;
