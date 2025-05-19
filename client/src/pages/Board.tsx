import { useEffect, useState } from 'react';

import { retrieveTickets, deleteTicket } from '../api/ticketAPI';
import ErrorPage from './ErrorPage';
import Swimlane from '../components/Swimlane';
import { TicketData } from '../interfaces/TicketData';
import { ApiMessage } from '../interfaces/ApiMessage';

import auth from '../utils/auth';

const boardStates = ['Todo', 'In Progress', 'Done'];

const Board = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [error, setError] = useState(false);
  const [loginCheck, setLoginCheck] = useState(false);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (auth.loggedIn()) {
        setLoginCheck(true);
        try {
          const data = await retrieveTickets();
          setTickets(data);
        } catch (err) {
          console.error('Failed to retrieve tickets:', err);
          setError(true);
        }
      } else {
        setLoginCheck(false);
      }
    };
    checkAndFetch();
  }, []);

  const deleteIndvTicket = async (ticketId: number): Promise<ApiMessage> => {
    try {
      const data = await deleteTicket(ticketId);
      // Refresh tickets after deletion
      const updated = await retrieveTickets();
      setTickets(updated);
      return data;
    } catch (err) {
      setError(true);
      return Promise.reject(err);
    }
  };

  if (error) {
    return <ErrorPage />;
  }

  return (
    <>
      {!loginCheck ? (
        <div className='login-notice'>
          <h1>Login to create & view tickets</h1>
        </div>
      ) : (
        <div className='board'>
          <div className='board-display'>
            {boardStates.map((status) => {
              const filteredTickets = tickets.filter(ticket => ticket.status === status);
              return (
                <Swimlane
                  title={status}
                  key={status}
                  tickets={filteredTickets}
                  deleteTicket={deleteIndvTicket}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Board;
