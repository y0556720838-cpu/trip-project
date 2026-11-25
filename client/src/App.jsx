import { useRoutes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';
import CompleteProfile from './screens/auth/CompleteProfile';
import UserScreen from './screens/user/UserScreen';
import Welcome from './screens/user/Welcome';
import Info from './screens/user/Info';
import TodosScreen from './screens/user/todos/TodosScreen';
import ListView from './screens/user/todos/ListView';
import PostsScreen from './screens/user/posts/PostsScreen';
import PostDetails from './screens/user/posts/PostDetails';
import AlbumsScreen from './screens/user/albums/AlbumsScreen';
import AlbumPhotos from './screens/user/albums/AlbumPhotos';
import Lightbox from './screens/user/albums/Lightbox';

export default function App() {
  const { currentUser } = useAuth();
  const home = currentUser ? `/${currentUser.username}` : '/login';

  return useRoutes([
    { path: '/', element: <Navigate to={home} replace /> },
    // משתמש מחובר לא צריך לראות כניסה/הרשמה
    { path: '/login', element: currentUser ? <Navigate to={home} replace /> : <Login /> },
    { path: '/register', element: currentUser ? <Navigate to={home} replace /> : <Register /> },
    { path: '/register/details', element: <CompleteProfile /> },
    {
      path: '/:username',
      element: currentUser ? <UserScreen /> : <Navigate to="/login" replace />,
      // תתי-הנתיבים מוצגים בתוך UserScreen במקום ה-Outlet
      children: [
        { index: true, element: <Welcome /> },
        { path: 'info', element: <Info /> },
        // בחירת רשימה טוענת רק את המשימות שלה: /david/todos/3
        { path: 'lists', element: <TodosScreen />, children: [{ path: ':listId', element: <ListView /> }] },
        // אותו רכיב לשני המצבים. key שונה - כדי שהמעבר ביניהם יתחיל state חדש
        {
          path: 'posts',
          element: <PostsScreen key="mine" mine />,
          children: [{ path: ':postId', element: <PostDetails /> }],
        },
        {
          path: 'all-posts',
          element: <PostsScreen key="all" />,
          children: [{ path: ':postId', element: <PostDetails /> }],
        },
        { path: 'albums', element: <AlbumsScreen /> },
        // תמונה פתוחה מקבלת כתובת משלה, וכך גם היא שורדת רענון
        {
          path: 'albums/:albumId/photos',
          element: <AlbumPhotos />,
          children: [{ path: ':photoId', element: <Lightbox /> }],
        },
      ],
    },
  ]);
}
