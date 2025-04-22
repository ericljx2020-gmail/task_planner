## Feature Specification: Chatbot-Driven Event Adder

### Overview
Add an AI-powered chat box to the Task Planner application, accessible from any page via **Shift+Enter**, to allow users to quickly add events by describing them in natural language. The chat box will use LangChain and OpenAI’s most cost-effective model to parse the description, determine an event title and timeframe, and add the event to the user’s calendar.

---

### User Stories
1. **Toggle Chat Box**
   - As a user, I want to open a mini chat interface by pressing **Shift+Enter** so I can describe an event in plain language.
   - As a user, I want to close the chat interface by pressing **Shift+Enter** again if I change my mind.

2. **Natural-Language Event Creation**
   - As a user, I want to type a brief description like "Lunch with Sarah next Tuesday at noon" and have the system create an event titled "Lunch with Sarah" on the correct date and time.

---

### Functional Requirements
1. **Global Key Listener**
   - Listen for the **Shift+Enter** key combination on every page.
   - Toggle visibility of the chat box component.

2. **Chat Box UI**
   - Display a floating chat window anchored in the bottom-right corner.
   - Include:
     - An input field for user messages.
     - A scrollable message area showing the user’s query and AI responses.
     - Minimal styling consistent with the app’s theme (rounded corners, subtle shadow).

3. **AI Integration**
   - Use LangChain to construct a simple conversational chain:
     - Input processor: cleans and forwards the user’s description.
     - OpenAI model: use `gpt-3.5-turbo` (or comparable lowest-cost model).
     - Post-processor: extract `title`, `start_time`, `end_time`, and optional `date` from the model’s JSON output.

4. **Event Creation**
   - Call the existing `addevent` API/service with the parsed parameters.
   - On success, display a confirmation message in the chat box.
   - On failure, show an error message and allow retry.

---

### Technical Design

#### Frontend (Vue.js)
1. **GlobalKeyHandler Mixin**
   - Create a Vue mixin `GlobalKeyHandler` that registers a `keydown` listener on `mounted()` and removes it on `unmounted()`.
   - In the handler, detect `event.shiftKey && event.key === 'Enter'` and emit a toggle event.

2. **ChatBox Component**
   - Props: `visible: Boolean`
   - Data:
     - `messages: Array<{ sender: 'user' | 'bot'; text: string }>`
     - `inputText: string`
     - `loading: boolean`
   - Methods:
     - `sendMessage()`: append user message, call backend, append AI response.
   - Template:
     ```vue
     <template>
       <div v-if="visible" class="chat-box fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg">
         <div class="messages overflow-auto h-60 p-2">
           <div v-for="msg in messages" :class="msg.sender">
             <span>{{ msg.text }}</span>
           </div>
         </div>
         <div class="input p-2 border-t">
           <input v-model="inputText" @keyup.enter="sendMessage" placeholder="Describe your event..." />
         </div>
       </div>
     </template>
     ```

3. **Integration in App Layout**
   - Import `GlobalKeyHandler` and `ChatBox` into `App.vue` or main layout.
   - Manage a `chatVisible` state to show/hide the chat box.

#### Backend (Django + LangChain)
1. **New Endpoint**: `POST /api/chat/add_event/`
   - Request body: `{ "query": "Lunch with Sarah next Tuesday at noon" }`
   - Response:
     - `200 OK` with `{ "success": true, "event": { id, title, date, start_time, end_time } }`
     - `400 Bad Request` with `{ "success": false, "error": "Could not parse datetime" }`

2. **LangChain Chain**
   ```python
   from langchain import OpenAI, LLMChain, PromptTemplate
   from .models import CalendarEvent
   from .serializers import CalendarEventSerializer

   template = '''
   Extract event details from the user description in JSON with keys title, date, start_time, end_time.
   Description: "{query}"
   '''
   prompt = PromptTemplate(template=template, input_variables=['query'])
   llm = OpenAI(model_name='gpt-3.5-turbo', temperature=0)
   chain = LLMChain(llm=llm, prompt=prompt)

   def handle_add_event(request):
       data = request.data
       result = chain.run({'query': data['query']})
       # parse JSON from result
       details = json.loads(result)
       event = CalendarEvent.objects.create(
           title=details['title'],
           date=details['date'],
           start_time=details['start_time'],
           end_time=details['end_time'],
           user=request.user
       )
       serializer = CalendarEventSerializer(event)
       return Response({ 'success': True, 'event': serializer.data })
   ```

---

### Implementation Steps
1. **Frontend**
   - Add `GlobalKeyHandler` mixin and integrate into main layout.
   - Create `ChatBox.vue` component and style it.
   - Wire up API calls to `/api/chat/add_event/`.

2. **Backend**
   - Install LangChain: `pip install langchain openai`.
   - Add new DRF view `ChatAddEventView`.
   - Configure routing in `urls.py`.
   - Write and test JSON extraction from LLM output.

3. **Testing**
   - Unit tests for the chain parser with various descriptions.
   - Integration test for the full flow.

---

### Future Enhancements
- Support follow-up messages (e.g., "Change it to 3pm").
- Use a more powerful AI model for complex parsing if needed.
- Persist chat history per user session.
- Add localization and multi-language support.

---

*End of specification*

