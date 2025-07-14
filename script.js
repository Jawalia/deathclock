class DeathClock {
    constructor() {
        this.birthYear = 2000; // Default birth year - you can change this
        this.lifeExpectancy = 75; // Average life expectancy in years
        this.deathDate = new Date((this.birthYear + this.lifeExpectancy), 0, 1);
        
        this.elements = {
            day: document.getElementById('day'),
            month: document.getElementById('month'),
            date: document.getElementById('date'),
            hour: document.getElementById('hour'),
            minute: document.getElementById('minute'),
            second: document.getElementById('second'),
            year: document.getElementById('year'),
            currentDateTime: document.getElementById('currentDateTime'),
            timeLeft: document.getElementById('timeLeft'),
            dayDot: document.getElementById('dayDot'),
            monthDot: document.getElementById('monthDot'),
            dateDot: document.getElementById('dateDot'),
            hourDot: document.getElementById('hourDot'),
            minuteDot: document.getElementById('minuteDot'),
            secondDot: document.getElementById('secondDot'),
            yearDot: document.getElementById('yearDot')
        };
        
        this.days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        this.months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        // Audio setup
        this.audioContext = null;
        this.isAudioEnabled = false;
        this.tickSound = null;
        this.tockSound = null;
        this.isTickTurn = true; // Alternates between tick and tock
        
        this.init();
    }
    
    init() {
        this.createAudioContext();
        this.createSoundToggle();
        this.setupSearch();
        this.updateGreeting();
        this.updateQuote();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        setInterval(() => this.updateGreeting(), 60000); // Update greeting every minute
        setInterval(() => this.updateQuote(), 300000); // Update quote every 5 minutes
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generateTickSounds();
        } catch (error) {
            console.log('Audio not supported in this browser');
        }
    }
    
    generateTickSounds() {
        // Generate tick sound (higher frequency)
        this.tickSound = this.createBeepSound(800, 0.1, 0.05); // 800Hz, 0.1 duration, 0.05 volume
        
        // Generate tock sound (lower frequency)
        this.tockSound = this.createBeepSound(600, 0.1, 0.05); // 600Hz, 0.1 duration, 0.05 volume
    }
    
    createBeepSound(frequency, duration, volume) {
        if (!this.audioContext) return null;
        
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    createSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.innerHTML = '🔊';
        soundToggle.title = 'Toggle Sound';
        soundToggle.style.cssText = `
            position: fixed;
            top: 30px;
            right: 20px;
            background: rgba(70, 130, 200, 0.2);
            color: white;
            border: 1px solid rgba(70, 130, 200, 0.4);
            padding: 12px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        soundToggle.addEventListener('click', () => {
            this.toggleSound(soundToggle);
        });
        
        soundToggle.addEventListener('mouseenter', () => {
            soundToggle.style.background = 'rgba(70, 130, 200, 0.4)';
            soundToggle.style.boxShadow = '0 0 15px rgba(70, 130, 200, 0.3)';
        });
        
        soundToggle.addEventListener('mouseleave', () => {
            soundToggle.style.background = 'rgba(70, 130, 200, 0.2)';
            soundToggle.style.boxShadow = 'none';
        });
        
        document.body.appendChild(soundToggle);
    }
    
    toggleSound(button) {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isAudioEnabled = !this.isAudioEnabled;
        button.innerHTML = this.isAudioEnabled ? '🔊' : '🔇';
        button.style.opacity = this.isAudioEnabled ? '1' : '0.6';
    }
    
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                // Check if it's a URL
                if (query.includes('.') && !query.includes(' ')) {
                    const url = query.startsWith('http') ? query : `https://${query}`;
                    window.open(url, '_blank');
                } else {
                    // Search with Google
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                }
                searchInput.value = '';
            }
        };
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    updateGreeting() {
        const now = new Date();
        const hour = now.getHours();
        const greetingElement = document.getElementById('greeting');
        const userNameElement = document.getElementById('userName');
        const currentDateElement = document.getElementById('currentDate');
        
        let greeting, userName;
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning';
            userName = 'Start your day right!';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
            userName = 'Hope you\'re having a great day!';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good Evening';
            userName = 'Time to unwind!';
        } else {
            greeting = 'Good Night';
            userName = 'Working late tonight?';
        }
        
        greetingElement.textContent = greeting;
        userNameElement.textContent = userName;
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateElement.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
    }
    
    updateQuote() {
        const quotes = [
            { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
            { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
            { text: "Time flies over us, but leaves its shadow behind.", author: "Nathaniel Hawthorne" },
            { text: "Lost time is never found again.", author: "Benjamin Franklin" },
            { text: "Time is the most valuable thing we have.", author: "Steve Jobs" },
            { text: "Yesterday is history, tomorrow is a mystery, today is a gift.", author: "Eleanor Roosevelt" },
            { text: "Time is a created thing. To say 'I don't have time' is like saying 'I don't want to'.", author: "Lao Tzu" },
            { text: "The bad news is time flies. The good news is you're the pilot.", author: "Michael Altshuler" },
            { text: "Time is the coin of your life. You spend it. Do not allow others to spend it for you.", author: "Carl Sandburg" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteText = document.querySelector('.quote-text');
        const quoteAuthor = document.querySelector('.quote-author');
        
        if (quoteText && quoteAuthor) {
            quoteText.textContent = `"${randomQuote.text}"`;
            quoteAuthor.textContent = `- ${randomQuote.author}`;
        }
    }
    
    playTickSound() {
        if (!this.isAudioEnabled || !this.audioContext) return;
        
        try {
            if (this.isTickTurn && this.tickSound) {
                this.tickSound();
            } else if (!this.isTickTurn && this.tockSound) {
                this.tockSound();
            }
            this.isTickTurn = !this.isTickTurn; // Alternate between tick and tock
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
    
    updateClock() {
        const now = new Date();
        
        // Update time display
        this.elements.day.textContent = this.days[now.getDay()];
        this.elements.month.textContent = this.months[now.getMonth()];
        this.elements.date.textContent = now.getDate().toString().padStart(2, '0');
        this.elements.hour.textContent = now.getHours().toString().padStart(2, '0');
        this.elements.minute.textContent = now.getMinutes().toString().padStart(2, '0');
        this.elements.second.textContent = now.getSeconds().toString().padStart(2, '0');
        this.elements.year.textContent = now.getFullYear();
        
        // Update center display
        this.elements.currentDateTime.textContent = 
            `${this.days[now.getDay()]} ${this.months[now.getMonth()]} ${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getFullYear()}`;
        
        // Update moving dots
        this.updateMovingDots(now);
        
        // Update time left
        this.updateTimeLeft(now);
        
        // Play tick sound
        this.playTickSound();
    }
    
    updateMovingDots(now) {
        const radius = 35; // Radius for dot movement
        
        // Day dot (weekly cycle)
        const dayAngle = (now.getDay() / 7) * 360;
        this.moveDot(this.elements.dayDot, dayAngle, radius);
        
        // Month dot (yearly cycle)
        const monthAngle = (now.getMonth() / 12) * 360;
        this.moveDot(this.elements.monthDot, monthAngle, radius);
        
        // Date dot (monthly cycle)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dateAngle = ((now.getDate() - 1) / daysInMonth) * 360;
        this.moveDot(this.elements.dateDot, dateAngle, radius);
        
        // Hour dot (daily cycle)
        const hourAngle = (now.getHours() / 24) * 360;
        this.moveDot(this.elements.hourDot, hourAngle, radius);
        
        // Minute dot (hourly cycle)
        const minuteAngle = (now.getMinutes() / 60) * 360;
        this.moveDot(this.elements.minuteDot, minuteAngle, radius);
        
        // Second dot (minute cycle)
        const secondAngle = (now.getSeconds() / 60) * 360;
        this.moveDot(this.elements.secondDot, secondAngle, radius);
        
        // Year dot (very slow cycle - based on decade)
        const yearInDecade = now.getFullYear() % 10;
        const yearAngle = (yearInDecade / 10) * 360;
        this.moveDot(this.elements.yearDot, yearAngle, radius);
    }
    
    moveDot(dotElement, angle, radius) {
        const radian = (angle - 90) * (Math.PI / 180); // -90 to start from top
        const x = radius * Math.cos(radian);
        const y = radius * Math.sin(radian);
        
        dotElement.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    updateTimeLeft(now) {
        const timeDiff = this.deathDate - now;
        
        if (timeDiff <= 0) {
            this.elements.timeLeft.textContent = "Time's up!";
            return;
        }
        
        const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
        const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        this.elements.timeLeft.textContent = 
            `Time left: ${years}y ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    
    // Method to set custom birth year and life expectancy
    setLifeParameters(birthYear, lifeExpectancy) {
        this.birthYear = birthYear;
        this.lifeExpectancy = lifeExpectancy;
        this.deathDate = new Date((this.birthYear + this.lifeExpectancy), 0, 1);
    }
}

// Initialize the clock when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const clock = new DeathClock();
    
    // You can customize the birth year and life expectancy here
     clock.setLifeParameters(2006, 80); // Born in 1995, expected to live 80 years
});

document.addEventListener('DOMContentLoaded', () => {
    
    const timeSections = document.querySelectorAll('.time-section');
    
    timeSections.forEach(section => {
        section.addEventListener('click', function() {
            this.style.transform += ' scale(1.1)';
            setTimeout(() => {
                this.style.transform = this.style.transform.replace(' scale(1.1)', '');
            }, 200);
        });
        
        
        section.addEventListener('mouseenter', function() {
            this.style.borderColor = '#4a9eff';
            this.style.boxShadow = '0 0 20px rgba(74, 158, 255, 0.3)';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.borderColor = 'rgba(100, 150, 200, 0.4)';
            this.style.boxShadow = 'none';
        });
    });
});