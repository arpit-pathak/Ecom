import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ls from "local-storage";
import { PageLoader } from '../../utils/loader';

function AffiliateHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Store the current affiliate user in local storage
    const data = {
        username: location.pathname.split("/")[1],
        timestamp: Date.now() // Store the current time in milliseconds
      };
      ls('affiliate_username', JSON.stringify(data));

    // Redirect to the homepage
    navigate('/');
  }, [location, navigate]);

  return <PageLoader /> ;
}

export default AffiliateHandler;
