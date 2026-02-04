const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError('As senhas não coincidem.');
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ cria usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('Falha ao criar usuário');

    // 🔥 2️⃣ LOGIN (ESSENCIAL)
    await supabase.auth.signInWithPassword({ email, password });

    const userId = signUpData.user.id;

    // 3️⃣ cria tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ nome_empresa: name })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 4️⃣ metadata
    await supabase.auth.updateUser({
      data: {
        tenant_id: tenant.id,
        name
      }
    });

    // 5️⃣ profile correto (USER ID)
    await supabase.from('profiles').insert({
      id: userId, // ✅ CORRETO
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
