export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `PP${year}${paddedSequence}`;
}

export function getNextSequence(): number {
  // In a real app, this would be fetched from the database
  // For now, we'll return a random large number
  return Math.floor(Math.random() * 900000) + 100000;
}
