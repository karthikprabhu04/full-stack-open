const Course = ({ course }) => {
  const total = course.parts.reduce((sum, part) => sum + part.exercises, 0);

  return (
    <div>
      <h1>{course.name}</h1>
      <ul>
        {course.parts.map((parts) => (
          <li key={parts.id}>
            {parts.name} {parts.exercises}
          </li>
        ))}
      </ul>
      <b>Total of {total} exercises</b>
    </div>
  );
};

export default Course;
