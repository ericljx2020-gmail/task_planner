/**
 * Creates a confetti animation at the specified element
 * @param {HTMLElement} element - The element to attach the confetti to
 */
export function createConfetti(element) {
  // Create a container for the confetti pieces
  const container = document.createElement('div');
  container.className = 'confetti-container';
  
  // Position the container relative to the clicked element
  const rect = element.getBoundingClientRect();
  container.style.top = `${rect.top}px`;
  container.style.left = `${rect.left}px`;
  container.style.width = `${rect.width}px`;
  container.style.height = `${rect.height}px`;
  
  // Colors and shapes for confetti
  const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
  const shapes = ['square', 'triangle', 'circle'];
  const animations = ['1', '2', '3', '4', '5']; // Different direction animations
  
  // Create 40 confetti pieces (more pieces for a more impressive effect)
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    
    // Randomly select color, shape, and animation
    const colorClass = `confetti-${colors[Math.floor(Math.random() * colors.length)]}`;
    const shapeClass = `confetti-${shapes[Math.floor(Math.random() * shapes.length)]}`;
    const animationClass = `confetti-${animations[Math.floor(Math.random() * animations.length)]}`;
    
    confetti.className = `confetti ${colorClass} ${shapeClass} ${animationClass}`;
    
    // Random position within the container with slight offset
    const randomOffset = 10; // Small offset from the checkbox center
    confetti.style.left = `calc(50% + ${(Math.random() * 20 - 10) + randomOffset}px)`;
    confetti.style.top = `calc(50% + ${(Math.random() * 20 - 10) + randomOffset}px)`;
    
    // Random size for more variety
    const size = 5 + Math.random() * 10; // Between 5px and 15px
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    
    // Random animation delay for more natural effect
    const delay = Math.random() * 0.3; // Up to 0.3s delay
    confetti.style.animationDelay = `${delay}s`;
    
    container.appendChild(confetti);
  }
  
  // Add container to document
  document.body.appendChild(container);
  
  // Remove container after animation is complete
  setTimeout(() => {
    document.body.removeChild(container);
  }, 2500); // Slightly longer than the animation duration (2s) to ensure all pieces complete
} 