localStorage.setItem('nav-option-active', "events");

/*
    VIEW EVENTS Page
    1) Get UserInfo
    2) Validate User Role:
    - "admin/admin/admin"
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {

    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();

    // 2)
    const userRole = userInfo.role;
    const [department_id, event_id, access_level] = userRole.split('/');

    if(department_id !== "admin" || event_id !== "admin" || access_level !== "admin"){
        location.href = '/authorization';
        throw new Error('Unauthorized!');
    }

    // 3)
    /*
        a) Load Events
        b) Set Up Delete Event Listeners
        c) Set Up Create Event Listeners
    */

    // a)
    const targetEndpoint = '/api/events';
    const result = await fetch(targetEndpoint, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${accessToken}`,
        }
    });

    const data = await result.json();

    if(!result.ok){
        alert(data.message);
        throw new Error(date.error);
    }

    const events = data.data.events;

    const eventsList = document.getElementById('main-list');
    events.forEach(eventItem => {
        const item = document.createElement('tr');
        item.classList = "border-t border-[#AAC1D7] hover:bg-[#E5EDF4] hover:shadow-lg";
        item.innerHTML = `
        <td class="py-3 px-4">
            <div class="event-name-wrapper">
                <a href="/event/${eventItem._id}/dashboard" class="text-blue-600 underline event-name">${eventItem.name}</a>
            </div>
            <div class="event-buttons mt-2 flex space-x-2">
                <button class="bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1" onclick="editEvent('')">
                    <i class="fas fa-edit"></i>
                    <span class="text-sm">Edit Event</span>
                </button>   
                <button id="delete-event-btn" class="bg-red-500 text-white px-2 py-1 rounded flex items-center space-x-1" onclick="confirmDeleteEvent('')">
                    <i class="fas fa-trash"></i>
                    <span class="text-sm">Delete Event</span>
                </button>
            </div>
        </td>
        `;

        eventsList.appendChild(item);

        // b)

        function confirmDeleteEvent(eventId) {
            document.getElementById('deletePopupOverlay').style.display = 'block';
            document.getElementById('deletePopup').style.display = 'block';
            document.getElementById('confirmDeleteButton').onclick = async () => {
                
                const targetEndpoint = `/api/events/${eventId}`;
                const result = await fetch(targetEndpoint, {
                    method: 'DELETE',
                    headers: {
                        'Authorization' : `Bearer ${accessToken}`,
                    }
                });

                const data = await result.json();

                if(!result.ok){
                    alert(data.message);
                    throw new Error(data.error);
                };

                location.href = '/admin/events/view'
                return;
            };
        }


        const deleteButton = item.querySelector('#delete-event-btn');
        deleteButton.addEventListener('click', async (e) => {
            deleteButton.disable = true;
            e.preventDefault();

            confirmDeleteEvent(eventItem._id);
        })
    });

    



})