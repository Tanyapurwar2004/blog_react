import Header from './Header';
import Nav from './Nav';
import Footer from './Footer';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import About from './About';
import Missing from './Missing';
import { Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import API from './API/posts'
import EditPost from './EditPost'; 
import useWindowsize from './Hooks/useWindowsize';
function App() {

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchresults, setSearchresults] = useState([]);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const navigate = useNavigate();
  const {width}=useWindowsize();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get('/posts');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const filteredResults = posts.filter((post) => {
      const searchString = (search || '').toString().toLowerCase();
      return (
        (post.body || '').toLowerCase().includes(searchString) ||
        (post.title || '').toLowerCase().includes(searchString)
      );
    });

    setSearchresults(filteredResults.reverse());
  }, [posts, search]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const newPost = { id, title: postTitle, datetime, body: postBody }

    try {
      const response = await API.post('/posts', newPost)
      const allPosts = [...posts, response.data]
      setPosts(allPosts);
      setPostTitle('');
      setPostBody('');
      navigate('/');
    } catch (err) {
      console.log(`Error:${err.message}`)
    }

  }
  const handleDelete = async (id) => {

    try {
      await API.delete(`/posts/${id}`);
      const postList = posts.filter(post => (post.id) !== id)
      setSearch(postList);
      navigate('/');
    }
    catch (err) {
      console.log(`Error:${err.message}`)
    }
  }
  const handleEdit = async (id) => {
    const datetime = format(new Date(), 'MMMM dd, yyyy pp');
    const updatedPost = { id, title: editTitle, datetime, body: editBody }

    try {
      const response = await API.put(`/posts/${id}`, updatedPost)
      setPosts(posts.map(post => post.id === id ? { ...response.data } : post))
      setEditTitle('');
      setEditBody('');
      navigate('/');

    } catch (err) {
      console.log(`Error:${err.message}`)
    }
  }

  return (
    <div className="App">
      <Header title="React Js Blog"  width={width}/>
      <Nav search={search} setSearch={setSearch} />
      <Routes>
        <Route path="/" element={<Home posts={searchresults} />} />
        <Route path="/post" element={<NewPost
          handleSubmit={handleSubmit}
          postTitle={postTitle}
          setPostTitle={setPostTitle}
          postBody={postBody}
          setPostBody={setPostBody}
        />} />
        <Route path="/edit/:id" element={<EditPost
          posts={posts}
          handleEdit={handleEdit}
          editBody={editBody}
          setEditBody={setEditBody}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
        />} />
        <Route path="/post/:id" element={<PostPage posts={posts} handleDelete={handleDelete} />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Missing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
