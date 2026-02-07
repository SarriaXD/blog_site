import { Message } from '@lib/types/chat.ts'
import { food } from '@public/images'

const sampleChatHistories = [
    {
        groupedName: 'Yesterday',
        histories: [
            {
                chatId: 'chat004',
                title: 'Curated Book Recommendations Based on Personal Reading Preferences',
            },
            {
                chatId: 'chat005',
                title: 'Comprehensive Tutorial on React Hooks and State Management',
            },
            {
                chatId: 'chat006',
                title: 'Effective Time Management Strategies for Increased Productivity',
            },
        ],
    },
    {
        groupedName: '2 Days Ago',
        histories: [
            {
                chatId: 'chat007',
                title: 'Personalized Workout Routine Planning for Fitness Goals',
            },
            {
                chatId: 'chat008',
                title: 'Efficient Data Analysis Techniques Using Python and Pandas',
            },
        ],
    },
    {
        groupedName: 'Last Week',
        histories: [
            {
                chatId: 'chat009',
                title: 'Customized Travel Itinerary Planning for European Vacation',
            },
            {
                chatId: 'chat010',
                title: 'Introduction to Machine Learning and Neural Networks',
            },
            {
                chatId: 'chat011',
                title: 'Implementing Effective Productivity Techniques in Daily Routine',
            },
        ],
    },
    {
        groupedName: '2 Weeks Ago',
        histories: [
            {
                chatId: 'chat012',
                title: 'Comprehensive Notes from Advanced Guitar Lessons on Jazz Theory',
            },
            {
                chatId: 'chat013',
                title: 'Personalized Movie Recommendations Based on Viewing History',
            },
        ],
    },
    {
        groupedName: 'Last Month',
        histories: [
            {
                chatId: 'chat014',
                title: 'Creative and Cost-Effective Home Renovation Ideas for Modern Living',
            },
            {
                chatId: 'chat015',
                title: 'Tailored Career Advice for Transitioning to the Tech Industry',
            },
            {
                chatId: 'chat016',
                title: 'Personalized Fitness Training Plan for Weight Loss',
            },
        ],
    },
    {
        groupedName: '2 Months Ago',
        histories: [
            {
                chatId: 'chat017',
                title: 'Sustainable Gardening Tips for Urban Spaces and Small Yards',
            },
            {
                chatId: 'chat018',
                title: 'Long-Term Financial Planning Strategies for Early Retirement',
            },
        ],
    },
    {
        groupedName: '3 Months Ago',
        histories: [
            {
                chatId: 'chat019',
                title: 'Effective Language Learning Strategies for Multilingual Proficiency',
            },
            {
                chatId: 'chat020',
                title: 'Collection of Healthy and Delicious Recipes for a Balanced Diet',
            },
        ],
    },
]

const weatherMessages: Message[] = [
    {
        id: '1',
        role: 'user',
        content: 'Tell me the weather in Winnipeg',
    },
    {
        id: '2',
        role: 'tools',
        content: '',
        toolResults: {
            toolName: 'getWeatherInformation',
            result: {
                location: {
                    name: 'Winnipeg',
                    localtime: '15:00',
                    tz_id: 'America/Winnipeg',
                },
                current: {
                    temp_c: 10,
                    condition: {
                        text: 'Sunny',
                        icon: 'https://example.com/sunny.png',
                    },
                },
                forecast: {
                    forecastday: [
                        {
                            date: 'Fri',
                            day: {
                                maxtemp_c: 15,
                                mintemp_c: 5,
                            },
                        },
                        {
                            date: 'Sat',
                            day: {
                                maxtemp_c: 20,
                                mintemp_c: 10,
                            },
                        },
                        {
                            date: 'Sun',
                            day: {
                                maxtemp_c: 25,
                                mintemp_c: 15,
                            },
                        },
                        {
                            date: 'Mon',
                            day: {
                                maxtemp_c: 30,
                                mintemp_c: 20,
                            },
                        },
                        {
                            date: 'Tue',
                            day: {
                                maxtemp_c: 26,
                                mintemp_c: 18,
                            },
                        },
                    ],
                },
            },
        },
    },
    {
        id: '3',
        role: 'assistant',
        content:
            'AssistantItem The current weather in Winnipeg, Manitoba, is as follows:\n' +
            '\n' +
            '- **Temperature**: 13.5°C (56.3°F)\n' +
            '- **Condition**: Sunny ![Sunny](https://cdn.weatherapi.com/weather/64x64/day/113.png)\n' +
            '- **Wind**: 4.3 mph (6.8 kph) from the Northwest\n' +
            '- **Humidity**: 67%\n' +
            '- **Visibility**: 10 km (6 miles)\n' +
            '- **Pressure**: 1016 mb (30.01 in)\n' +
            '\n' +
            '### Upcoming Forecast:\n' +
            '- **Friday**: Max temperature of 24.8°C, Min temperature of 11.3°C\n' +
            '- **Saturday**: Max temperature of 26.8°C, Min temperature of 10.3°C\n' +
            '- **Sunday**: Max temperature of 28.8°C, Min temperature of 10.7°C\n' +
            '\n' +
            'It looks like a beautiful sunny day ahead! If you need more information or have any other questions, feel free to ask.',
    },
]

const searchMessages: Message[] = [
    {
        id: '1',
        role: 'user',
        content: 'Search for latest news in Winnipeg',
    },
    {
        id: '2',
        role: 'tools',
        content: '',
        toolResults: {
            toolName: 'search',
            result: {
                length: 1,
            },
        },
    },
    {
        id: '3',
        role: 'assistant',
        content:
            'Here are the latest news updates from Winnipeg:\n' +
            '\n' +
            "1. **[CBC Manitoba - News Winnipeg](https://www.cbc.ca/newswinnipeg/)**: Recent reports include the receding floodwaters in southeastern Manitoba and Habitat for Humanity's initiative to build homes for 15 families in Winnipeg.\n" +
            '\n' +
            '### Relevant Images\n' +
            '- ![Winnipeg News](https://www.cbc.ca/mediacentre/content/images/WinnipegNews2015-feature.jpg)\n' +
            '\n' +
            'For more detailed information, you can visit the links provided. If you have any specific topics or areas of interest regarding Winnipeg news, feel free to ask!',
    },
]

const modalMessages: Message[] = [
    {
        id: '1',
        role: 'user',
        content: 'What is in this?',
        images: [food],
        files: [
            {
                name: 'Food Menu',
                extension: 'pdf',
            },
        ],
    },
    {
        id: '2',
        role: 'assistant',
        content:
            'The image features a table with three dishes:\n' +
            '\n' +
            '1. **A sesame seed burger**: It appears to have lettuce, pickles, and possibly some meat and cheese inside.\n' +
            '2. **A savory dish on toast**: This looks like a piece of bread topped with a mixture that may include mushrooms, a poached egg, and some herbs or spices.\n' +
            '3. **A fried chicken dish**: Served on a slice of bread, garnished with a slice of lemon or another colorful topping.\n' +
            '\n' +
            'Additionally, there are drinks on the table, including a green beverage and several glasses of water. The setting has a wooden table and a casual dining atmosphere.',
    },
]

export { sampleChatHistories, weatherMessages, searchMessages, modalMessages }
