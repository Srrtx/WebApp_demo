document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                document.getElementById('usernameDisplay').innerText = `Welcome, ${data.user.username}`;
            } else {
                document.getElementById('usernameDisplay').innerText = 'Not logged in';
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
});
