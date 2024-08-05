
/*
NEW FORM PAGE
    1) Get UserInfo from Token
    2) Determine if Role = "admin/admin/admin" or "admin/<this-event-id>/admin" or "<this-department-id>/<this-event-id>/admin"
        - [false] redirect to '/authorization'
    3) Load Page Contents
*/

document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    // 1)
    const userInfo = await getAuthUserInfo();

    // 2)
    const eventId = document.getElementById('event-id').textContent;
    const departmentId = document.getElementById('department-id').textContent;
    const userRole = userInfo.role;

    // Destructure Role
    const [department_id, event_id, access_level] = userRole.split('/');

    if((department_id !== "admin" && department_id !== departmentId ) || (event_id !== "admin" && event_id !== eventId) || access_level !== "admin"){
        location.href = '/authorization';
        throw new Error("Unauthorized!");
    }

    // 3)
    /*
        Listeners:
        a) 'Add Question Button' Click Listener
        b) 'Remove Question Button' Click Listener
        c) 'Submit Form Button' Click Listener
    */

    // a)
    const addQuestionButton = document.getElementById('add-question-btn');
    let questionCount = 0;

    addQuestionButton.addEventListener('click', async (e) => {
        e.preventDefault();

        questionCount += 1;

        const questionsList = document.getElementById('questions-list');
        const item = document.createElement('div');
        item.classList = "mb-4";

        // Old
        /*
        item.innerHTML = 
        `
            <div class="col">
              <div class="form-floating">
                <input
                  type="text"
                  name="questions"
                  id="input-question-${questionCount}"
                  class="form-control"
                  placeholder="Question"
                  required
                />
                <label for="input-question-${questionCount}" class="form-label"
                  >Question</label
                >
              </div>
              <button type="button" class="btn btn-danger remove-question">
                Remove Question
              </button>
            </div>
        `;

        */

        item.innerHTML = `
            <label for="input-question-${questionCount}" class="block text-sm font-medium text-gray-700">Question 1:</label>
            <input name="questions" type="text" id="input-question-${questionCount}" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Question" required>
            <button type="button" class="bg-red-500 text-white px-4 py-2 rounded remove-question-btn">Remove Question</button>
        `;

        questionsList.appendChild(item);
        setRemoveQuestionButtonsListeners();
    })

    // b)
    const setRemoveQuestionButtonsListeners = () => {
        const removeQuestionButtons = document.querySelectorAll('.remove-question-btn');
        removeQuestionButtons.forEach(removeQuestionButton => {
            removeQuestionButton.addEventListener('click', async (e) => {
                e.preventDefault();

                const questionsList = document.getElementById('questions-list');

                const removedElement = e.target.parentElement;
                
                questionsList.removeChild(removedElement);
                questionCount -= 1;
                
            })
        })
    }

    setRemoveQuestionButtonsListeners();
    

    // c)
    const submitButton = document.getElementById('submit-btn');
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;

        if(questionCount < 1){
            alert('Please Add Questions!');
            throw new Error('Invalid amount of Questions!');
        }

        const form = document.getElementById('main-form');
        
        // Validate Form Contents
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            if(!input.value){
                alert("Please Fill All Fields!");
                throw new Error("There are still Empty Fields!")
            }
        });

        const formData = new FormData(form);

        const targetEndpoint = "/api/forms";
        const result = await fetch(targetEndpoint, {
            method: 'POST',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
            },
            body: formData,
        })

        const data = await result.json();

        if(!result.ok){
            alert(data.message);
            throw new Error(data.error);
        }

        location.href = `/event/${eventId}/department/${departmentId}/dashboard`;
        return;
    })

})