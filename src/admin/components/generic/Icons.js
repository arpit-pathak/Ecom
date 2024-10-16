
//Start -- Sidebar Menu Icons
const DashboardIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && '!text-indigo-500'
          }`}
        d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z"
      />
      <path
        className={`fill-current text-slate-600 ${pathname.includes(name) && 'text-indigo-600'}`}
        d="M12 3c-4.963 0-9 4.037-9 9s4.037 9 9 9 9-4.037 9-9-4.037-9-9-9z"
      />
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && 'text-indigo-200'}`}
        d="M12 15c-1.654 0-3-1.346-3-3 0-.462.113-.894.3-1.285L6 6l4.714 3.301A2.973 2.973 0 0112 9c1.654 0 3 1.346 3 3s-1.346 3-3 3z"
      />
    </svg>
  )
}

const ProductIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && 'text-indigo-300'}`}
        d="M13 15l11-7L11.504.136a1 1 0 00-1.019.007L0 7l13 8z"
      />
      <path
        className={`fill-current text-slate-700 ${pathname.includes(name) && '!text-indigo-600'}`}
        d="M13 15L0 7v9c0 .355.189.685.496.864L13 24v-9z"
      />
      <path
        className={`fill-current text-slate-600 ${pathname.includes(name) && 'text-indigo-500'}`}
        d="M13 15.047V24l10.573-7.181A.999.999 0 0024 16V8l-11 7.047z"
      />
    </svg>
  )
}

const UserManagementIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current text-slate-600 ${pathname.includes(name) && 'text-indigo-500'}`}
        d="M18.974 8H22a2 2 0 012 2v6h-2v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5h-2v-6a2 2 0 012-2h.974zM20 7a2 2 0 11-.001-3.999A2 2 0 0120 7zM2.974 8H6a2 2 0 012 2v6H6v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5H0v-6a2 2 0 012-2h.974zM4 7a2 2 0 11-.001-3.999A2 2 0 014 7z"
      />
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && 'text-indigo-300'}`}
        d="M12 6a3 3 0 110-6 3 3 0 010 6zm2 18h-4a1 1 0 01-1-1v-6H6v-6a3 3 0 013-3h6a3 3 0 013 3v6h-3v6a1 1 0 01-1 1z"
      />
    </svg>
  )
}

const EmailNotificationIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current text-slate-600 ${pathname.includes(name) && 'text-indigo-500'}`}
        d="M16 13v4H8v-4H0l3-9h18l3 9h-8Z"
      />
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && 'text-indigo-300'}`}
        d="m23.72 12 .229.686A.984.984 0 0 1 24 13v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-8c0-.107.017-.213.051-.314L.28 12H8v4h8v-4H23.72ZM13 0v7h3l-4 5-4-5h3V0h2Z"
      />
    </svg>
  )
}

const MessageIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current text-slate-600 ${pathname.includes(name) && 'text-indigo-500'}`}
        d="M14.5 7c4.695 0 8.5 3.184 8.5 7.111 0 1.597-.638 3.067-1.7 4.253V23l-4.108-2.148a10 10 0 01-2.692.37c-4.695 0-8.5-3.184-8.5-7.11C6 10.183 9.805 7 14.5 7z"
      />
      <path
        className={`fill-current text-slate-400 ${pathname.includes(name) && 'text-indigo-300'}`}
        d="M11 1C5.477 1 1 4.582 1 9c0 1.797.75 3.45 2 4.785V19l4.833-2.416C8.829 16.85 9.892 17 11 17c5.523 0 10-3.582 10-8s-4.477-8-10-8z"
      />
    </svg>
  )
}

const SettingIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-500' : 'text-slate-600'}`}
        d="M19.714 14.7l-7.007 7.007-1.414-1.414 7.007-7.007c-.195-.4-.298-.84-.3-1.286a3 3 0 113 3 2.969 2.969 0 01-1.286-.3z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        d="M10.714 18.3c.4-.195.84-.298 1.286-.3a3 3 0 11-3 3c.002-.446.105-.885.3-1.286l-6.007-6.007 1.414-1.414 6.007 6.007z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-500' : 'text-slate-600'}`}
        d="M5.7 10.714c.195.4.298.84.3 1.286a3 3 0 11-3-3c.446.002.885.105 1.286.3l7.007-7.007 1.414 1.414L5.7 10.714z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        d="M19.707 9.292a3.012 3.012 0 00-1.415 1.415L13.286 5.7c-.4.195-.84.298-1.286.3a3 3 0 113-3 2.969 2.969 0 01-.3 1.286l5.007 5.006z"
      />
    </svg>
  )
}

const WebContentIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <circle
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-500' : 'text-slate-600'}`}
        cx="16"
        cy="8"
        r="8"
      />
      <circle
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        cx="8"
        cy="16"
        r="8"
      />
    </svg>
  )
}


const OrderIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path className={`fill-current ${pathname.includes(name) ? 'text-indigo-600' : 'text-slate-600'}`}
        d="M8.07 16H10V8H8.07a8 8 0 110 8z"
      />
      <path className={`fill-current ${pathname.includes(name) ? 'text-indigo-600' : 'text-slate-400'}`}
        d="M15 12L8 6v5H0v2h8v5z"
      />
    </svg>
  )
}

const CampaignIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-500' : 'text-slate-600'}`}
        d="M20 7a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 0120 7zM4 23a.75.75 0 01-.75-.75 1.5 1.5 0 00-1.5-1.5.75.75 0 110-1.5 1.5 1.5 0 001.5-1.5.75.75 0 111.5 0 1.5 1.5 0 001.5 1.5.75.75 0 110 1.5 1.5 1.5 0 00-1.5 1.5A.75.75 0 014 23z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        d="M17 23a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 012 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1zM7 13a1 1 0 01-1-1 4 4 0 00-4-4 1 1 0 110-2 4 4 0 004-4 1 1 0 112 0 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-1 1z"
      />
    </svg>
  )
}

const FinanceIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        d="M13 6.068a6.035 6.035 0 0 1 4.932 4.933H24c-.486-5.846-5.154-10.515-11-11v6.067Z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-500' : 'text-slate-700'}`}
        d="M18.007 13c-.474 2.833-2.919 5-5.864 5a5.888 5.888 0 0 1-3.694-1.304L4 20.731C6.131 22.752 8.992 24 12.143 24c6.232 0 11.35-4.851 11.857-11h-5.993Z"
      />
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-600' : 'text-slate-600'}`}
        d="M6.939 15.007A5.861 5.861 0 0 1 6 11.829c0-2.937 2.167-5.376 5-5.85V0C4.85.507 0 5.614 0 11.83c0 2.695.922 5.174 2.456 7.17l4.483-3.993Z"
      />
    </svg>
  )
}

const ProfileIcon = ({ pathname, name }) => {
  return (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
      <path
        className={`fill-current ${pathname.includes(name) ? 'text-indigo-300' : 'text-slate-400'}`}
        d="M12 12c2.21 0 4-2.79 4-4a4 4 0 1 0-8 0c0 1.21 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );

}


//End -- Sidebar Menu Icons

const SideBarIcons = {
  DashboardIcon,
  WebContentIcon,
  ProductIcon,
  OrderIcon,
  CampaignIcon,
  FinanceIcon,
  UserManagementIcon,
  EmailNotificationIcon,
  MessageIcon,
  SettingIcon,
  ProfileIcon,
};
export default SideBarIcons;