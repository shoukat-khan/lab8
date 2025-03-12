const request = require('supertest');
const app = require('./events');

describe('Event Planner API Tests', () => {
  let token;

  test('User Registration', async () => {
    const res = await request(app).post('/register').send({
      username: 'testuser',
      password: 'password123'
    });
    expect(res.statusCode).toBe(201);
  });

  test('User Login', async () => {
    const res = await request(app).post('/login').send({
      username: 'testuser',
      password: 'password123'
    });
    expect(res.statusCode).toBe(200);
    token = res.body.token;
  });

  test('Create Event', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Meeting',
        description: 'Team meeting',
        date: '2025-03-20',
        time: '10:00',
        category: 'Meetings',
        reminder: true
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Meeting');
  });

  test('Fetch Events', async () => {
    const res = await request(app)
      .get('/events')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
