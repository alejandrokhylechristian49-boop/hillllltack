const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://vbudafrnegmlbntnzdlj.supabase.co',
    process.env.SUPABASE_ANON_KEY  // ✅ hidden in Netlify dashboard
);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Username and password are required' })
            };
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, full_name, status, role, department')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid username or password' })
            };
        }

        if ((user.status || 'active').toLowerCase() === 'inactive') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'inactive', full_name: user.full_name || user.username })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ user })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error. Please try again.' })
        };
    }
};
