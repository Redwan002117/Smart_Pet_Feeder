"use strict";(self.webpackChunksmart_pet_feeder=self.webpackChunksmart_pet_feeder||[]).push([[267],{267:(e,s,t)=>{t.r(s),t.d(s,{default:()=>c});var i=t(43),a=t(584),n=t(662),r=t(579);const c=()=>{const[e,s]=(0,i.useState)(!0),[t,c]=(0,i.useState)(null),[o,l]=(0,i.useState)(null),[d,h]=(0,i.useState)(null),[u,m]=(0,i.useState)({}),[f,x]=(0,i.useState)("notifications"),[p,g]=(0,i.useState)(""),[j,N]=(0,i.useState)(""),[w,v]=(0,i.useState)(""),[b,y]=(0,i.useState)(!1),[_,C]=(0,i.useState)(!1),[S,k]=(0,i.useState)(null),[F,A]=(0,i.useState)(null),[E,q]=(0,i.useState)(""),[U,T]=(0,i.useState)([]),[D,P]=(0,i.useState)(!1),L=(0,n.Zp)();(0,i.useEffect)((()=>{R(),G(),M()}),[]);const R=async()=>{try{s(!0);const{data:{user:e}}=await a.N.auth.getUser();if(!e)throw new Error("User not authenticated");const{data:t,error:i}=await a.N.from("profiles").select("*").eq("id",e.id).single();if(i)throw i;h(t),y(t.two_factor_enabled)}catch(e){console.error("Error fetching user profile:",e),c(e.message||"Failed to load user profile")}finally{s(!1)}},G=async()=>{try{s(!0);const{data:{user:e}}=await a.N.auth.getUser();if(!e)throw new Error("User not authenticated");const{data:t,error:i}=await a.N.from("notification_preferences").select("*").eq("user_id",e.id).single();if(i)throw i;m(t)}catch(e){console.error("Error fetching notification preferences:",e),c(e.message||"Failed to load notification preferences")}finally{s(!1)}},M=async()=>{try{var e;s(!0);const{data:{session:t}}=await a.N.auth.getSession();if(!t)throw new Error("No active session");T([{id:t.access_token,created_at:t.created_at,browser:(null===(e=navigator.userAgent.match(/chrome|firefox|safari|edge|opera/i))||void 0===e?void 0:e[0])||"Unknown",os:navigator.platform||"Unknown",current:!0}])}catch(t){console.error("Error fetching session:",t),c(t.message||"Failed to load sessions")}finally{s(!1)}},O=async(e,t)=>{try{s(!0),c(null);const{data:{user:i}}=await a.N.auth.getUser();if(!i)throw new Error("User not authenticated");const{error:n}=await a.N.from("notification_preferences").update({[e]:t}).eq("user_id",i.id);if(n)throw n;m((s=>({...s,[e]:t}))),l("Notification preferences updated successfully")}catch(i){console.error("Error updating notification preferences:",i),c(i.message||"Failed to update notification preferences")}finally{s(!1)}};return e&&!d?(0,r.jsxs)("div",{className:"loading-container",children:[(0,r.jsx)("div",{className:"loading-spinner"}),(0,r.jsx)("p",{children:"Loading settings..."})]}):(0,r.jsxs)("div",{className:"settings-container",children:[(0,r.jsx)("div",{className:"settings-header",children:(0,r.jsx)("h1",{children:"Settings"})}),t&&(0,r.jsxs)("div",{className:"error-alert",children:[(0,r.jsx)("i",{className:"icon-warning"}),(0,r.jsx)("p",{children:t}),(0,r.jsx)("button",{className:"error-close",onClick:()=>c(null),children:"\xd7"})]}),o&&(0,r.jsxs)("div",{className:"success-alert",children:[(0,r.jsx)("i",{className:"icon-check-circle"}),(0,r.jsx)("p",{children:o}),(0,r.jsx)("button",{className:"success-close",onClick:()=>l(null),children:"\xd7"})]}),(0,r.jsxs)("div",{className:"settings-content",children:[(0,r.jsxs)("div",{className:"settings-sidebar",children:[(0,r.jsxs)("button",{className:"settings-tab "+("notifications"===f?"active":""),onClick:()=>x("notifications"),children:[(0,r.jsx)("i",{className:"icon-bell"}),(0,r.jsx)("span",{children:"Notifications"})]}),(0,r.jsxs)("button",{className:"settings-tab "+("security"===f?"active":""),onClick:()=>x("security"),children:[(0,r.jsx)("i",{className:"icon-lock"}),(0,r.jsx)("span",{children:"Security"})]}),(0,r.jsxs)("button",{className:"settings-tab "+("account"===f?"active":""),onClick:()=>x("account"),children:[(0,r.jsx)("i",{className:"icon-user"}),(0,r.jsx)("span",{children:"Account"})]})]}),(0,r.jsxs)("div",{className:"settings-main",children:["notifications"===f&&(0,r.jsxs)("div",{className:"settings-section",children:[(0,r.jsx)("h2",{children:"Notification Preferences"}),(0,r.jsx)("p",{className:"section-description",children:"Choose how and when you receive notifications about your pet feeder."}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Notification Channels"}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Email Notifications"}),(0,r.jsx)("div",{className:"setting-description",children:"Receive notifications about your pet feeder via email"})]}),(0,r.jsxs)("label",{className:"switch",children:[(0,r.jsx)("input",{type:"checkbox",checked:u.email_notifications,onChange:()=>O("email_notifications",!u.email_notifications)}),(0,r.jsx)("span",{className:"slider"})]})]}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Push Notifications"}),(0,r.jsx)("div",{className:"setting-description",children:"Receive in-browser push notifications"})]}),(0,r.jsxs)("label",{className:"switch",children:[(0,r.jsx)("input",{type:"checkbox",checked:u.push_notifications,onChange:()=>O("push_notifications",!u.push_notifications)}),(0,r.jsx)("span",{className:"slider"})]})]})]}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Notification Types"}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Low Food Alert"}),(0,r.jsx)("div",{className:"setting-description",children:"Get notified when food level is running low"})]}),(0,r.jsxs)("label",{className:"switch",children:[(0,r.jsx)("input",{type:"checkbox",checked:u.low_food_alert,onChange:()=>O("low_food_alert",!u.low_food_alert)}),(0,r.jsx)("span",{className:"slider"})]})]}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Feeding Complete Alert"}),(0,r.jsx)("div",{className:"setting-description",children:"Get notified when a feeding is completed"})]}),(0,r.jsxs)("label",{className:"switch",children:[(0,r.jsx)("input",{type:"checkbox",checked:u.feeding_complete_alert,onChange:()=>O("feeding_complete_alert",!u.feeding_complete_alert)}),(0,r.jsx)("span",{className:"slider"})]})]}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Schedule Reminders"}),(0,r.jsx)("div",{className:"setting-description",children:"Get reminded shortly before scheduled feedings"})]}),(0,r.jsxs)("label",{className:"switch",children:[(0,r.jsx)("input",{type:"checkbox",checked:u.schedule_reminder,onChange:()=>O("schedule_reminder",!u.schedule_reminder)}),(0,r.jsx)("span",{className:"slider"})]})]})]})]}),"security"===f&&(0,r.jsxs)("div",{className:"settings-section",children:[(0,r.jsx)("h2",{children:"Security Settings"}),(0,r.jsx)("p",{className:"section-description",children:"Manage your account security settings and authentication methods."}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Change Password"}),(0,r.jsxs)("form",{onSubmit:async e=>{if(e.preventDefault(),j===w)try{s(!0),c(null);const{data:{user:e}}=await a.N.auth.getUser();if(!e)throw new Error("User not authenticated");const{error:t}=await a.N.auth.updateUser({password:j});if(t)throw t;l("Password updated successfully"),g(""),N(""),v("")}catch(t){console.error("Error changing password:",t),c(t.message||"Failed to change password")}finally{s(!1)}else c("New password and confirm password do not match")},className:"security-form",children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"current-password",children:"Current Password"}),(0,r.jsx)("input",{id:"current-password",type:"password",value:p,onChange:e=>g(e.target.value),required:!0})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"new-password",children:"New Password"}),(0,r.jsx)("input",{id:"new-password",type:"password",value:j,onChange:e=>N(e.target.value),required:!0})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"confirm-password",children:"Confirm Password"}),(0,r.jsx)("input",{id:"confirm-password",type:"password",value:w,onChange:e=>v(e.target.value),required:!0})]}),(0,r.jsx)("button",{type:"submit",className:"btn btn-primary",disabled:e,children:"Update Password"})]})]}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Two-Factor Authentication"}),(0,r.jsxs)("div",{className:"setting-item",children:[(0,r.jsxs)("div",{className:"setting-info",children:[(0,r.jsx)("div",{className:"setting-name",children:"Two-Factor Authentication"}),(0,r.jsx)("div",{className:"setting-description",children:"Add an extra layer of security to your account"})]}),b?(0,r.jsx)("button",{className:"btn btn-outline",onClick:async()=>{try{s(!0),c(null),c("Two-factor authentication is not available in the current version of Supabase.")}catch(e){console.error("Error disabling 2FA:",e),c(e.message||"Failed to disable 2FA")}finally{s(!1)}},disabled:e,children:"Disable 2FA"}):(0,r.jsx)("button",{className:"btn btn-primary",onClick:async()=>{try{s(!0),c(null),c("Two-factor authentication setup is not available in the current version of Supabase."),C(!1)}catch(e){console.error("Error setting up 2FA:",e),c(e.message||"Failed to set up 2FA")}finally{s(!1)}},disabled:e,children:"Enable 2FA"})]}),_&&(0,r.jsxs)("div",{className:"twofa-setup",children:[(0,r.jsx)("h4",{children:"Set up Two-Factor Authentication"}),(0,r.jsx)("p",{children:"Scan the QR code with an authenticator app like Google Authenticator or Authy, then enter the 6-digit code to enable 2FA."}),(0,r.jsx)("div",{className:"twofa-qr-container",children:(0,r.jsx)("img",{src:S||"",alt:"2FA QR Code",className:"twofa-qr"})}),F&&(0,r.jsxs)("div",{className:"twofa-secret",children:[(0,r.jsx)("p",{children:"Or enter this code manually:"}),(0,r.jsx)("code",{children:F})]}),(0,r.jsxs)("form",{onSubmit:async e=>{e.preventDefault();try{s(!0),c(null),c("Two-factor authentication is not available in the current version of Supabase."),C(!1)}catch(t){console.error("Error enabling 2FA:",t),c(t.message||"Failed to enable 2FA")}finally{s(!1)}},className:"twofa-form",children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"twofa-code",children:"Verification Code"}),(0,r.jsx)("input",{id:"twofa-code",type:"text",value:E,onChange:e=>q(e.target.value),placeholder:"Enter 6-digit code",required:!0,maxLength:6,pattern:"[0-9]{6}"})]}),(0,r.jsxs)("div",{className:"twofa-buttons",children:[(0,r.jsx)("button",{type:"button",className:"btn btn-outline",onClick:()=>C(!1),children:"Cancel"}),(0,r.jsx)("button",{type:"submit",className:"btn btn-primary",disabled:e||6!==E.length,children:"Verify & Enable"})]})]})]})]}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Active Sessions"}),(0,r.jsx)("div",{className:"sessions-list",children:U.map(((e,s)=>{return(0,r.jsx)("div",{className:"session-item",children:(0,r.jsxs)("div",{className:"session-info",children:[(0,r.jsxs)("div",{className:"session-name",children:[e.browser," - ",e.os,e.current&&(0,r.jsx)("span",{className:"current-badge",children:"Current"})]}),(0,r.jsxs)("div",{className:"session-date",children:["Active since: ",(t=e.created_at,new Date(t).toLocaleString())]})]})},s);var t}))}),(0,r.jsx)("button",{className:"btn btn-outline",onClick:async()=>{try{s(!0),c(null),l("This feature is not available in the current version")}catch(e){console.error("Error:",e),c(e.message||"Feature not available")}finally{s(!1)}},disabled:e||U.length<=1,children:"Log Out Other Sessions"})]})]}),"account"===f&&(0,r.jsxs)("div",{className:"settings-section",children:[(0,r.jsx)("h2",{children:"Account Settings"}),(0,r.jsx)("p",{className:"section-description",children:"Manage your account preferences and data."}),(0,r.jsxs)("div",{className:"settings-group",children:[(0,r.jsx)("h3",{children:"Data Export"}),(0,r.jsx)("p",{className:"setting-description",children:"Export all your data including device history, pet profiles, and account information."}),(0,r.jsx)("button",{className:"btn btn-outline",children:"Export My Data"})]}),(0,r.jsxs)("div",{className:"settings-group danger-zone",children:[(0,r.jsx)("h3",{children:"Danger Zone"}),(0,r.jsx)("p",{className:"setting-description danger-text",children:"Permanently delete your account and all associated data. This action cannot be undone."}),D?(0,r.jsxs)("div",{className:"delete-confirm",children:[(0,r.jsx)("p",{className:"confirm-text",children:"Are you absolutely sure? This will permanently delete your account, all your devices, pets, and feeding history."}),(0,r.jsxs)("div",{className:"confirm-buttons",children:[(0,r.jsx)("button",{className:"btn btn-outline",onClick:()=>P(!1),children:"Cancel"}),(0,r.jsx)("button",{className:"btn btn-danger",onClick:async()=>{try{if(s(!0),c(null),!D)return P(!0),void s(!1);if(!d)return;const{error:e}=await a.N.from("devices").delete().eq("user_id",d.id);if(e)throw e;const{error:t}=await a.N.from("pets").delete().eq("user_id",d.id);if(t)throw t;const{error:i}=await a.N.from("schedules").delete().eq("user_id",d.id);if(i)throw i;const{error:n}=await a.N.from("notification_preferences").delete().eq("user_id",d.id);if(n)throw n;const{error:r}=await a.N.from("profiles").delete().eq("id",d.id);if(r)throw r;const{error:o}=await a.N.auth.admin.deleteUser(d.id);if(o)throw o;await a.N.auth.signOut(),L("/",{replace:!0})}catch(e){console.error("Error deleting account:",e),c(e.message||"Failed to delete account"),P(!1)}finally{s(!1)}},disabled:e,children:"Yes, Delete My Account"})]})]}):(0,r.jsx)("button",{className:"btn btn-danger",onClick:()=>P(!0),children:"Delete Account"})]})]})]})]})]})}}}]);
//# sourceMappingURL=267.bbc9bdc2.chunk.js.map