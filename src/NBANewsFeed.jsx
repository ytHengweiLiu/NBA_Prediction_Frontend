
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper } from 'lucide-react';

function NBANewsFeed() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Fetching NBA news...');
        // setLoading(true);
        const fetchNews = async () => {
            try {
                const response = await axios.get('https://collection.omega-financials.com/sportsNews')
                console.log('Response:', response.data);

                if (response.data.status === 'success') {
                    // setNews(response.data);
                    console.log('NBA news fetched successfully:', response.data);
                    setNews(response.data.articles.slice(0, 3));
                }
                else {
                    console.error('Error fetching NBA news:', response.statusText);
                }

            } catch (error) {
                console.error('Error fetching NBA news:', error);
                setError('Failed to fetch news');
            }
            finally {
                setLoading(false);
                console.log('NBA news fetch complete');
            }
        };
        fetchNews();
    }, []);

    if (loading) return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-2">
                <Newspaper className="mr-2 text-blue-400" size={20} />
                Latest NBA News
            </h3>
            <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-2">
                <Newspaper className="mr-2 text-blue-400" size={20} />
                Latest NBA News
            </h3>
            <p className="text-red-400">Failed to load news</p>
        </div>
    );



    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 flex items-center mb-2">
                <Newspaper className="mr-2 text-blue-400" size={20} />
                Latest NBA News
            </h3>

            <div className="flex space-x-3">
                {news.length > 0 ? news.map((item, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-650 transition ">
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <h4 className="text-white font-medium hover:text-blue-300 transition">{item.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{new Date(item.published).toLocaleDateString()}</p>
                        </a>
                    </div>
                )) : (
                    <p className="text-gray-400">No recent news available</p>
                )}
            </div>
        </div>
    );
}

export default NBANewsFeed;