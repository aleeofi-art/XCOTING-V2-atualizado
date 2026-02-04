const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError('As senhas não coincidem.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ CRIA USUÁRIO
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (signUpError) throw signUpError;

    // 2️⃣ LOGIN (obrigatório pra ter sessão)
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError) throw loginError;

    const userId = loginData.user.id; // ✅ ID CORRETO

    // 3️⃣ CRIA TENANT
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ nome_empresa: name })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 4️⃣ SALVA TENANT NO AUTH METADATA
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenant.id,
        name
      }
    });

    // 5️⃣ PROFILE (🔥 CORRETO AQUI)
    await supabase.from('profiles').insert({
      id: userId, // ✅ USER ID (não tenant)
      name,
      email,
      role: 'operador',
      tenant_id: tenant.id
    });

    navigate('/dashboard');

  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};
