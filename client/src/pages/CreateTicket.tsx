import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketAPI';
import { TicketData } from '../interfaces/TicketData';
import { UserData } from '../interfaces/UserData';
import { retrieveUsers } from '../api/userAPI';

// Ensure TicketData fields are never null in this component
interface LocalTicketData extends Omit<TicketData, 'name' | 'description' | 'status' | 'assignedUserId'> {
  name: string;
  description: string;
  status: string;
  assignedUserId: number;
}

const CreateTicket = () => {
  const [newTicket, setNewTicket] = useState<LocalTicketData>({
    id: 0,
    name: '',
    description: '',
    status: 'Todo',
    assignedUserId: 1,
    assignedUser: null
  });

  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const data = await retrieveUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to retrieve user info', err);
      }
    };
    getAllUsers();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTicket((prev) => {
      if (!prev) return prev;
      if (name === 'assignedUserId') {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newTicket.name.trim() && newTicket.description.trim()) {
      await createTicket(newTicket);
      navigate('/');
    }
  };

  return (
    <div className='form-container'>
      <form className='form' onSubmit={handleSubmit}>
        <h1>Create Ticket</h1>
        <label htmlFor='tName'>Ticket Name</label>
        <input
          id='tName'
          name='name'
          type='text'
          value={newTicket.name || ''}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='tStatus'>Ticket Status</label>
        <select
          name='status'
          id='tStatus'
          value={newTicket.status || ''}
          onChange={handleInputChange}
        >
          <option value='Todo'>Todo</option>
          <option value='In Progress'>In Progress</option>
          <option value='Done'>Done</option>
        </select>
        <label htmlFor='tDescription'>Ticket Description</label>
        <textarea
          id='tDescription'
          name='description'
          value={newTicket.description || ''}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='tUserId'>Assigned User</label>
        <select
          name='assignedUserId'
          id='tUserId'
          value={newTicket.assignedUserId || 0}
          onChange={handleInputChange}
        >
          {users.length > 0 ? (
            users.map((user) => (
              <option key={user.id} value={user.id ?? 0}>
                {user.username}
              </option>
            ))
          ) : (
            <option value=''>No users found</option>
          )}
        </select>
        <button type='submit' disabled={!newTicket.name.trim() || !newTicket.description.trim()}>
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateTicket;
