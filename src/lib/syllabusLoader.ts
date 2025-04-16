import { Course } from '@/lib/types';
import { defaultCourses } from '@/data/defaultCourses';

export function loadSyllabusFromExcel(): Course[] {
  return defaultCourses;
}

export function findSimilarCourses(input: string, courses: Course[]): Course[] {
  const searchTerm = input.toLowerCase();
  return courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm) ||
    levenshteinDistance(course.name.toLowerCase(), searchTerm) <= 2
  );
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => 
    Array(a.length + 1).fill(null)
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[b.length][a.length];
}
