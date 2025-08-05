<<<<<<< HEAD
TypeError: Cannot read properties of null (reading 'phone')

Source
components\TruckDetailsModal.tsx (167:21) @ phone

  165 |     cuisine_type = [],
  166 |     social_media = {},
> 167 |     contact_info: { phone = '', email = '', website = '' } = {},
      |                     ^
  168 |     average_rating = 0,
  169 |     review_count = 0,
  170 |   } = truck;
=======


1 of 1 error
Next.js (14.2.30) is outdated (learn more)

Unhandled Runtime Error
TypeError: Cannot read properties of null (reading 'auth')

Source
app\auth\AuthProvider.tsx (89:18) @ auth

  87 |     const {
  88 |       data: { subscription },
> 89 |     } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
     |                  ^
  90 |       const typedSession = session as Session | null;
  91 |       setUser(typedSession?.user ?? undefined);
  92 |       setSession(typedSession);
Call Stack
React
commitHookEffectListMount
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (21102:1)
commitHookPassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23154:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23259:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23370:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
recursivelyTraversePassiveMountEffects
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23237:1)
commitPassiveMountOnFiber
node_modules\next\dist\compiled\react-dom\cjs\react-dom.development.js (23256:1)
Hide collapsed frames
>>>>>>> data-specialist-2-work
