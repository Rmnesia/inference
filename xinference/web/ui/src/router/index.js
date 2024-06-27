import { Navigate, useRoutes } from 'react-router-dom'

import Layout from '../scenes/_layout'
import ClusterInfo from '../scenes/cluster_info'
import LaunchModel from '../scenes/launch_model'
import Datasets from '../scenes/dataset'
import DatasetDetail from '../scenes/dataset/detail'
import Login from '../scenes/login/login'
import RegisterModel from '../scenes/register_model'
import RunningModels from '../scenes/running_models'
import TrainModel from '../scenes/train_model'
import TrainDetail from '../scenes/train_model/detail'
import TestModel from '../scenes/test_model'
import TestDetail from "../scenes/test_model/detail";

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Navigate to="launch_model/llm" replace />,
      },
      {
        path: 'launch_model/:Modeltype/:subType?',
        element: <LaunchModel />,
      },
        {
        path: 'dataset',
        element: <Datasets />,
      },
      {
        path: 'dataset/detail/:id/:type',
        element: <DatasetDetail />,
      },
      {
        path: 'running_models/:runningModelType',
        element: <RunningModels />,
      },
      {
        path: 'register_model',
        element: <RegisterModel />,
      },
      {
        path: 'train_model/:Modeltype',
        element: <TrainModel />,
      },
        {
        path: 'train_model/detail/:id',
        element: <TrainDetail />,
      },
      {
        path: 'test_model/:Modeltype',
        element: <TestModel />,
      },
         {
        path: 'test_model/detail/:id',
        element: <TestDetail />,
      },
      {
        path: 'cluster_info',
        element: <ClusterInfo />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <Navigate to="launch_model/llm" replace />,
  },
]
const WraperRoutes = () => {
  let element = useRoutes(routes)
  return element
}

export default WraperRoutes
