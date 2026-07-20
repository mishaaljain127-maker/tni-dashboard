import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const DOMAINS = [
  'Finance',
  'Compliance',
  'Social Welfare',
  'Strategy & Growth',
  'Production',
  'HR PR CR',
  'Purchasing & Sourcing',
  'Sales',
  'R&D & Product Development',
  'Marketing',
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'domain'

  const softLaunch = new Date('2026-09-04');
  const hardLaunch = new Date('2026-11-08');
  const today = new Date();

  const daysToSoft = Math.ceil((softLaunch - today) / (1000 * 60 * 60 * 24));
  const daysToHard = Math.ceil((hardLaunch - today) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    const tasksRef = ref(database, 'tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksList = Object.entries(data).map(([id, task]) => ({
          id,
          ...task,
        }));
        setTasks(tasksList);
      }
      setLoading(false);
    });
  }, []);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    update(ref(database, `tasks/${draggableId}`), { status: newStatus });
  };

  const today_str = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(
    t => t.date === today_str && (t.priority === 'CRITICAL' || t.priority === 'HIGH')
  );

  const tasksByDomain = (domain) =>
    tasks.filter(t => t.domain === domain && (t.priority === 'CRITICAL' || t.priority === 'HIGH'));

  const toDoTasks = todaysTasks.filter(t => t.status === 'to-do');
  const inProgressTasks = todaysTasks.filter(t => t.status === 'in-progress');
  const doneTasks = todaysTasks.filter(t => t.status === 'done');

  if (loading) {
    return <div className="app loading">Loading...</div>;
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="countdown-duo">
          <div className="countdown soft-launch">
            <div className="countdown-label">Soft Launch</div>
            <div className="countdown-days">{daysToSoft}</div>
            <div className="countdown-date">Sept 4</div>
          </div>
          <div className="countdown hard-launch">
            <div className="countdown-label">Hard Launch</div>
            <div className="countdown-days">{daysToHard}</div>
            <div className="countdown-date">Nov 8</div>
          </div>
        </div>
        <h1>The Nutrition Initiative</h1>
        <div className="view-toggle">
          <button
            className={viewMode === 'today' ? 'active' : ''}
            onClick={() => setViewMode('today')}
          >
            Today's Focus
          </button>
          <button
            className={viewMode === 'domain' ? 'active' : ''}
            onClick={() => setViewMode('domain')}
          >
            By Domain
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        {viewMode === 'today' ? (
          // TODAY'S VIEW
          <div className="today-view">
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-count critical">{toDoTasks.length}</span>
                <span className="stat-label">To-Do</span>
              </div>
              <div className="stat">
                <span className="stat-count progress">{inProgressTasks.length}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat">
                <span className="stat-count done">{doneTasks.length}</span>
                <span className="stat-label">Done</span>
              </div>
            </div>

            <div className="board">
              <Droppable droppableId="to-do">
                {(provided, snapshot) => (
                  <div
                    className={`column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="column-title">To-Do</h2>
                    <div className="tasks">
                      {toDoTasks.length === 0 ? (
                        <p className="empty">All caught up</p>
                      ) : (
                        toDoTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task ${task.priority.toLowerCase()} ${
                                  snapshot.isDragging ? 'dragging' : ''
                                }`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="task-header">
                                  <span className={`badge ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                  </span>
                                  <span className="task-domain">{task.domain}</span>
                                </div>
                                <p className="task-title">{task.title}</p>
                                {task.owner && <p className="task-owner">@{task.owner}</p>}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <Droppable droppableId="in-progress">
                {(provided, snapshot) => (
                  <div
                    className={`column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="column-title">In Progress</h2>
                    <div className="tasks">
                      {inProgressTasks.length === 0 ? (
                        <p className="empty">Start a task</p>
                      ) : (
                        inProgressTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task ${task.priority.toLowerCase()} ${
                                  snapshot.isDragging ? 'dragging' : ''
                                }`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="task-header">
                                  <span className={`badge ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                  </span>
                                  <span className="task-domain">{task.domain}</span>
                                </div>
                                <p className="task-title">{task.title}</p>
                                {task.owner && <p className="task-owner">@{task.owner}</p>}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <Droppable droppableId="done">
                {(provided, snapshot) => (
                  <div
                    className={`column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="column-title">Done</h2>
                    <div className="tasks">
                      {doneTasks.length === 0 ? (
                        <p className="empty">No wins yet</p>
                      ) : (
                        doneTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task ${task.priority.toLowerCase()} ${
                                  snapshot.isDragging ? 'dragging' : ''
                                }`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="task-header">
                                  <span className={`badge ${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                  </span>
                                  <span className="task-domain">{task.domain}</span>
                                </div>
                                <p className="task-title">{task.title}</p>
                                {task.owner && <p className="task-owner">@{task.owner}</p>}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ) : (
          // DOMAIN VIEW
          <div className="domain-view">
            {DOMAINS.map((domain) => {
              const domainTasks = tasksByDomain(domain);
              const toDoCount = domainTasks.filter(t => t.status === 'to-do').length;
              const inProgressCount = domainTasks.filter(t => t.status === 'in-progress').length;
              const doneCount = domainTasks.filter(t => t.status === 'done').length;

              return (
                <div key={domain} className="domain-section">
                  <div className="domain-header">
                    <h2>{domain}</h2>
                    <div className="domain-counts">
                      <span className="count to-do">{toDoCount}</span>
                      <span className="count in-progress">{inProgressCount}</span>
                      <span className="count done">{doneCount}</span>
                    </div>
                  </div>

                  <div className="domain-board">
                    <Droppable droppableId={`${domain}-to-do`}>
                      {(provided, snapshot) => (
                        <div
                          className={`domain-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3>To-Do</h3>
                          <div className="tasks">
                            {domainTasks
                              .filter(t => t.status === 'to-do')
                              .map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      className={`task ${task.priority.toLowerCase()} ${
                                        snapshot.isDragging ? 'dragging' : ''
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <span className={`badge ${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                      </span>
                                      <p className="task-title">{task.title}</p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    <Droppable droppableId={`${domain}-in-progress`}>
                      {(provided, snapshot) => (
                        <div
                          className={`domain-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3>In Progress</h3>
                          <div className="tasks">
                            {domainTasks
                              .filter(t => t.status === 'in-progress')
                              .map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      className={`task ${task.priority.toLowerCase()} ${
                                        snapshot.isDragging ? 'dragging' : ''
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <span className={`badge ${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                      </span>
                                      <p className="task-title">{task.title}</p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    <Droppable droppableId={`${domain}-done`}>
                      {(provided, snapshot) => (
                        <div
                          className={`domain-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3>Done</h3>
                          <div className="tasks">
                            {domainTasks
                              .filter(t => t.status === 'done')
                              .map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      className={`task ${task.priority.toLowerCase()} ${
                                        snapshot.isDragging ? 'dragging' : ''
                                      }`}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <span className={`badge ${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                      </span>
                                      <p className="task-title">{task.title}</p>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DragDropContext>
    </div>
  );
}
