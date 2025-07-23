import { supabase } from '@/lib/supabase';
export async function verifyAdminAccess(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader)
            return false;
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabase.auth.getUser(token);
        const user = data === null || data === void 0 ? void 0 : data.user;
        if (error || !user)
            return false;
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        return (profile === null || profile === void 0 ? void 0 : profile.role) === 'admin';
    }
    catch (_a) {
        return false;
    }
}
